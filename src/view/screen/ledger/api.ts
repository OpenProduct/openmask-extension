import TransportWebHID from "@ledgerhq/hw-transport-webhid";
import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { TonTransport } from "@ton-community/ton-ledger";
import { Cell } from "@ton/core";
import { useContext } from "react";
import { LedgerDriver, WalletState } from "../../../libs/entries/wallet";
import { popUpInternalEventEmitter } from "../../../libs/popUpEvent";
import {
  LedgerPathForAccount,
  LedgerTransfer,
} from "../../../libs/service/transfer/ledger";
import { delay } from "../../../libs/state/accountService";
import { QueryType } from "../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  WalletStateContext,
} from "../../context";
import { saveAccountState } from "../api";

let workchain = 0;
let chain = workchain === -1 ? 255 : 0;

export const getLedgerWalletState = async (
  network: string,
  driver: LedgerDriver,
  transport: TonTransport,
  accountIndex: number
): Promise<WalletState> => {
  let bounceable = false;
  let path = LedgerPathForAccount(network, workchain, accountIndex);
  let response = await transport.getAddress(path, {
    chain,
    bounceable,
    testOnly: network === "testnet",
  });
  let publiKey: Buffer = response.publicKey;
  let address: string = response.address;

  return {
    name: `Ledger ${accountIndex + 1}`,
    mnemonic: "",
    address,
    publicKey: publiKey.toString("hex"),
    version: "v4R2",
    isBounceable: bounceable,
    ledger: {
      index: accountIndex,
      driver,
      productId: transport.transport.deviceModel?.id,
      productName: transport.transport.deviceModel?.productName,
    },
  };
};

export const useLedgerAccounts = (driver: LedgerDriver) => {
  const network = useContext(NetworkContext);
  return useMutation<WalletState[], Error, TonTransport>(async (transport) => {
    return Promise.all(
      [0, 1, 2, 3, 4].map((index) =>
        getLedgerWalletState(network, driver, transport, index)
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

interface LedgerDevice {
  opened: boolean;
  productId: string;
  productName: string;
}

export const useLedgerDevice = (wallet: WalletState) => {
  return useQuery<LedgerDevice | null>([QueryType.ledger, wallet], async () => {
    if (wallet.ledger?.driver === "HID") {
      let [device] = await TransportWebHID.list();
      return device ?? null;
    } else {
      let [device] = await TransportWebUSB.list();
      return device ?? null;
    }
  });
};

const closeWebHID = async () => {
  let [device] = await TransportWebHID.list();
  if (device) {
    let transportHID = device.opened
      ? new TransportWebHID(device)
      : await TransportWebHID.open(device);

    await transportHID.close();
  }
};

const connectWebHID = async (): Promise<TransportWebHID> => {
  while (true) {
    let [device] = await TransportWebHID.list();
    if (device === undefined) {
      await TransportWebHID.create();
      await delay(1000);
      continue;
    }

    let transportHID = device.opened
      ? new TransportWebHID(device)
      : await TransportWebHID.open(device);

    return transportHID;
  }
};

const closeWebUSB = async () => {
  let [device] = await TransportWebUSB.list();
  if (device) {
    let transportWeb = await TransportWebUSB.open(device);
    await transportWeb.close();
  }
};

const connectWebUSB = async () => {
  while (true) {
    let [device] = await TransportWebUSB.list();

    if (device === undefined) {
      await TransportWebUSB.create();
      await delay(1000);
      continue;
    }

    return await TransportWebUSB.open(device);
  }
};

export const useUnPairLedgerDevice = (driver?: LedgerDriver) => {
  const client = useQueryClient();
  return useMutation(async () => {
    if (driver === "HID") {
      await closeWebHID();
    } else {
      await closeWebUSB();
    }

    await client.invalidateQueries([QueryType.ledger]);
  });
};

export const useConnectLedgerDevice = (wallet: WalletState) => {
  const client = useQueryClient();
  return useMutation(async () => {
    if (wallet.ledger?.driver === "HID") {
      await connectWebHID();
    } else {
      await connectWebUSB();
    }
    await client.invalidateQueries([QueryType.ledger]);
  });
};

export const useConnectLedgerTransport = (driver?: LedgerDriver) => {
  return useMutation<TonTransport, Error>(async () => {
    const transportWeb =
      driver === "USB" ? await connectWebUSB() : await connectWebHID();

    let index = 0;

    while (index < 20) {
      let transport = new TonTransport(transportWeb);
      let appOpened = false;

      try {
        // We wrap it in a try-catch, because isAppOpen() can throw an error in case of an incorrect application
        appOpened = await transport.isAppOpen();
      } catch (e) {}

      if (!appOpened) {
        await delay(1000);
        index++;
        continue;
      }

      return transport;
    }

    throw new Error(
      "Unable to connect to a Ledger. Please open Ton Ledger App to 'Ton is ready' screen and try one more time."
    );
  });
};

export const useSignLedgerTransaction = () => {
  const network = useContext(NetworkContext);
  const wallet = useContext(WalletStateContext);
  return useMutation(
    async ({
      transport,
      params,
    }: {
      transport: TonTransport;
      params: LedgerTransfer;
    }) => {
      const path = LedgerPathForAccount(
        network,
        workchain,
        wallet.ledger?.index!
      );
      const signed = await transport.signTransaction(path, params);
      return signed;
    }
  );
};

export const signLedgerTransaction = async (
  data: LedgerTransfer
): Promise<Cell> => {
  const id = Date.now();
  return new Promise<Cell>((resolve, reject) => {
    popUpInternalEventEmitter.emit("LedgerTransaction", {
      method: "LedgerTransaction",
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
