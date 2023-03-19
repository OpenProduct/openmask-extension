import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { TonTransport } from "ton-ledger";
import { WalletState } from "../../../../libs/entries/wallet";
import { LedgerPathForAccount } from "../../../../libs/service/transfer/ledger";
import { AccountStateContext, NetworkContext } from "../../../context";
import { saveAccountState } from "../../api";

let workchain = 0;
let chain = workchain === -1 ? 255 : 0;

export const getLedgerWalletState = async (
  network: string,
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
    isLedger: true,
    LedgerIndex: accountIndex,
    LedgerDriver: "USB",
  };
};

export const useLedgerAccounts = () => {
  const network = useContext(NetworkContext);
  return useMutation<WalletState[], Error, TonTransport>(async (transport) => {
    return Promise.all(
      [0, 1, 2, 3, 4].map((index) =>
        getLedgerWalletState(network, transport, index)
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
