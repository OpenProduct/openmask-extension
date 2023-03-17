import TransportWebUSB from "@ledgerhq/hw-transport-webusb";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { TonTransport } from "ton-ledger";
import { WalletState } from "../../../../libs/entries/wallet";
import { delay } from "../../../../libs/state/accountService";
import { AccountStateContext, NetworkContext } from "../../../context";
import { saveAccountState } from "../../api";

let workchain = 0;
let chain = workchain === -1 ? 255 : 0;

export const useConnectLadgerDevice = () => {
  return useMutation<void, Error>(async () => {
    await TransportWebUSB.create();
  });
};

export const useGetLadgerTransport = () => {
  return useMutation<TonTransport, Error>(async () => {
    while (true) {
      // Searching for devices
      let devices = await TransportWebUSB.list();
      console.log(devices);
      if (devices.length === 0) {
        await delay(1000);
        continue;
      }
      let hid = await TransportWebUSB.open(devices[0]);
      console.log(hid);
      let transport = new TonTransport(hid);
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
  });
};

export const getLadgerWalletState = async (
  network: string,
  transport: TonTransport,
  accountIndex: number
): Promise<WalletState> => {
  let testnet = network === "testnet";
  let bounceable = false;
  let path = pathForAccount(testnet, workchain, accountIndex);
  let response = await transport.getAddress(path, {
    chain,
    bounceable,
    testOnly: testnet,
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

function pathForAccount(testnet: boolean, workchain: number, account: number) {
  let network = testnet ? 1 : 0;
  let chain = workchain === -1 ? 255 : 0;
  return [44, 607, network, chain, account, 0]; // Last zero is reserved for alternative wallet contracts
}
