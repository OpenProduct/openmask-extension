import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { Cell } from "ton-core";
import { TonTransport } from "ton-ledger";
import { WalletState } from "../../../libs/entries/wallet";
import { popUpInternalEventEmitter } from "../../../libs/popUpEvent";
import {
  ladgerPathForAccount,
  LadgerTransfer,
} from "../../../libs/service/transfer/ladger";
import { delay } from "../../../libs/state/accountService";
import {
  AccountStateContext,
  NetworkContext,
  WalletStateContext,
} from "../../context";
import { saveAccountState } from "../api";

let workchain = 0;
let chain = workchain === -1 ? 255 : 0;

export const getLadgerWalletState = async (
  network: string,
  transport: TonTransport,
  accountIndex: number
): Promise<WalletState> => {
  let bounceable = false;
  let path = ladgerPathForAccount(network, workchain, accountIndex);
  let response = await transport.getAddress(path, {
    chain,
    bounceable,
    testOnly: network === "testnet",
  });
  let publiKey: Buffer = response.publicKey;
  let address: string = response.address;

  return {
    name: `Ladger ${accountIndex + 1}`,
    mnemonic: "",
    address,
    publicKey: publiKey.toString("hex"),
    version: "v4R2",
    isBounceable: bounceable,
    isLadger: true,
    ladgerIndex: accountIndex,
    ladgerDriver: "USB",
  };
};

export const useLadgerAccounts = () => {
  const network = useContext(NetworkContext);
  return useMutation<WalletState[], Error, TonTransport>(async (transport) => {
    return Promise.all(
      [0, 1, 2, 3, 4].map((index) =>
        getLadgerWalletState(network, transport, index)
      )
    );
  });
};

export const useAddWalletMutation = () => {
  const network = useContext(NetworkContext);
  const account = useContext(AccountStateContext);
  const client = useQueryClient();

  return useMutation<void, Error, WalletState[]>(async (accounts) => {
    const filtered = accounts.filter(
      (item) =>
        !account.wallets.some((wallet) => wallet.address === item.address)
    );
    const value = {
      ...account,
      wallets: [...account.wallets, ...filtered],
      activeWallet: accounts[0].address,
    };
    await saveAccountState(network, client, value);
  });
};

export const useConnectLadgerDevice = () => {
  return useMutation<void, Error>(async () => {
    await TransportWebUSB.create();
  });
};

export const getLadgerTransportWebHID = async () => {
  while (true) {
    // Searching for devices
    let [device] = await TransportWebHID.list();

    if (device === undefined) {
      await TransportWebHID.create();
      await delay(3000);
      continue;
    }

    let transportHID = device.opened
      ? new TransportWebHID(device)
      : await TransportWebHID.open(device);

    let transport = new TonTransport(transportHID);
    let appOpened = false;

    try {
      // We wrap it in a try-catch, because isAppOpen() can throw an error in case of an incorrect application
      appOpened = await transport.isAppOpen();
    } catch (e) {}

    if (!appOpened) {
      await delay(1000);
      continue;
    }

    return transport;
  }
};

export const getLadgerTransportWebUSB = async () => {
  while (true) {
    // Searching for devices
    let devices = await TransportWebUSB.list();
    console.log(devices);
    if (devices.length === 0) {
      await delay(1000);
      continue;
    }
    let transportWeb = await TransportWebUSB.open(devices[0]);

    let transport = new TonTransport(transportWeb);
    let appOpened = false;

    try {
      // We wrap it in a try-catch, because isAppOpen() can throw an error in case of an incorrect application
      appOpened = await transport.isAppOpen();
    } catch (e) {}

    if (!appOpened) {
      await delay(1000);
      continue;
    }

    return transport;
  }
};

export const useGetLadgerTransport = () => {
  return useMutation<TonTransport, Error>(() => getLadgerTransportWebUSB());
};

export const useSignLadgerTransaction = () => {
  const network = useContext(NetworkContext);
  const wallet = useContext(WalletStateContext);
  return useMutation<
    Cell,
    Error,
    { transport: TonTransport; params: LadgerTransfer }
  >(async ({ transport, params }) => {
    const path = ladgerPathForAccount(network, workchain, wallet.ladgerIndex!);
    const signed = await transport.signTransaction(path, params);
    return signed;
  });
};

export const signLadgerTransaction = async (
  data: LadgerTransfer
): Promise<Cell> => {
  const id = Date.now();
  return new Promise<Cell>((resolve, reject) => {
    popUpInternalEventEmitter.emit("ladgerTransaction", {
      method: "ladgerTransaction",
      id,
      params: data,
    });

    const onCallback = (message: {
      method: "response";
      id?: number | undefined;
      params: { cell: string } | { error: Error };
    }) => {
      if (message.id === id) {
        const { params } = message;
        popUpInternalEventEmitter.off("response", onCallback);

        if ("cell" in params) {
          resolve(Cell.fromBase64(params.cell));
        } else {
          reject(params.error);
        }
      }
    };

    popUpInternalEventEmitter.on("response", onCallback);
  });
};
