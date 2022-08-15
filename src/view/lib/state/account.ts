import {
  QueryClient,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { useContext } from "react";
import * as tonMnemonic from "tonweb-mnemonic";
import browser from "webextension-polyfill";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
} from "../../context";
import { checkForError } from "../utils";
import { QueryType, useNetworkStore } from "./";
import { createWallet, importWallet, WalletState } from "./wallet";

export interface AccountState {
  wallets: WalletState[];
  activeWallet?: string;
}

const defaultAccountState: AccountState = {
  wallets: [],
};

export const useAccountState = () => {
  return useNetworkStore<AccountState>(QueryType.account, defaultAccountState);
};

const saveAccountState = async (
  network: string,
  client: QueryClient,
  value: AccountState
) => {
  const { local } = browser.storage;
  await local.set({ [`${network}_${QueryType.account}`]: value });
  const err = checkForError();
  if (err) {
    throw err;
  }
  client.setQueryData([network, QueryType.account], value);
  await client.invalidateQueries([network, value.activeWallet]);
};

export const useCreateWalletMutation = () => {
  const network = useContext(NetworkContext);
  const ton = useContext(TonProviderContext);
  const account = useContext(AccountStateContext);
  const client = useQueryClient();

  return useMutation<void, Error>(async () => {
    const wallet = await createWallet(ton, account.wallets.length + 1);
    const wallets = account.wallets.concat([wallet]);
    const value = {
      ...account,
      wallets,
      activeWallet: wallet.address,
    };
    await saveAccountState(network, client, value);
  });
};

export const validateMnemonic = (mnemonic: string[]) => {
  if (!tonMnemonic.validateMnemonic(mnemonic) || mnemonic.length !== 24) {
    throw new Error("Mnemonic is not valid");
  }
};

export const useImportWalletMutation = () => {
  const client = useQueryClient();
  const ton = useContext(TonProviderContext);
  const network = useContext(NetworkContext);
  const data = useContext(AccountStateContext);

  return useMutation<void, Error, string>(async (value) => {
    const mnemonic = value.trim().split(" ");
    validateMnemonic(mnemonic);

    const wallet = await importWallet(ton, mnemonic, data.wallets.length + 1);
    if (data.wallets.some((w) => w.address === wallet.address)) {
      throw new Error("Wallet already connect");
    }
    const wallets = data.wallets.concat([wallet]);
    const state = {
      ...data,
      wallets,
      activeWallet: wallet.address,
    };
    await saveAccountState(network, client, state);
  });
};

export const useSelectWalletMutation = () => {
  const account = useContext(AccountStateContext);
  const network = useContext(NetworkContext);
  const client = useQueryClient();
  return useMutation<void, Error, string>(async (address) => {
    const value = {
      ...account,
      activeWallet: address,
    };
    await saveAccountState(network, client, value);
  });
};

export const useUpdateWalletMutation = () => {
  const account = useContext(AccountStateContext);
  const network = useContext(NetworkContext);
  const client = useQueryClient();
  return useMutation<void, Error, Partial<WalletState>>(async (newFields) => {
    const wallets = account.wallets.map((wallet) => {
      if (wallet.address === account.activeWallet) {
        return {
          ...wallet,
          ...newFields,
        };
      }
      return wallet;
    });

    const value = {
      ...account,
      wallets,
    };
    await saveAccountState(network, client, value);
  });
};
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
