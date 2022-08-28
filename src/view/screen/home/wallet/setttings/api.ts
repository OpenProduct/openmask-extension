import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import TonWeb from "tonweb";
import { AccountState } from "../../../../../libs/entries/account";
import { WalletState } from "../../../../../libs/entries/wallet";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
} from "../../../../context";
import { saveAccountState } from "../../../api";

export const useDeleteWalletMutation = () => {
  const account = useContext(AccountStateContext);
  const network = useContext(NetworkContext);
  const client = useQueryClient();
  return useMutation<void, Error, void>(async () => {
    const { activeWallet, wallets } = account;
    if (wallets.length === 1) {
      throw new Error("Deleting single account");
    }
    const items = wallets.filter((w) => w.address !== activeWallet);
    const value = {
      ...account,
      wallets: items,
      activeWallet: items[0].address,
    };
    await saveAccountState(network, client, value);
  });
};

export const useUpdateWalletMutation = () => {
  const account = useContext(AccountStateContext);
  const network = useContext(NetworkContext);
  const ton = useContext(TonProviderContext);
  const client = useQueryClient();
  return useMutation<void, Error, Partial<WalletState>>(async (newFields) => {
    const [active] = account.wallets.filter(
      (w) => w.address === account.activeWallet
    );

    let updatedWallet: WalletState = {
      ...active,
      ...newFields,
    };

    const WalletClass = ton.wallet.all[updatedWallet.version!];
    const walletContract = new WalletClass(ton.provider, {
      publicKey: TonWeb.utils.hexToBytes(updatedWallet.publicKey),
      wc: 0,
    });
    const address = await walletContract.getAddress();
    updatedWallet.address = address.toString(
      true,
      true,
      updatedWallet.isBounceable
    );

    const wallets = account.wallets.map((w) => {
      if (w.address === account.activeWallet) {
        return updatedWallet;
      }
      return w;
    });

    const value: AccountState = {
      ...account,
      wallets,
      activeWallet: updatedWallet.address,
    };

    await saveAccountState(network, client, value);
  });
};
