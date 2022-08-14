import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import * as tonMnemonic from "tonweb-mnemonic";
import browser from "webextension-polyfill";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
} from "../../home/context";
import { checkForError } from "../utils";
import { QueryType, useNetworkStore } from "./";
import { createWallet, importWallet, WalletState } from "./wallet";

export interface AccountState {
  isInitialized: boolean;
  isLock: boolean;
  password?: string;
  wallets: WalletState[];
  activeWallet?: string;
}

const defaultAccountState: AccountState = {
  isInitialized: false,
  isLock: false,
  wallets: [],
};

export const useAccountState = () => {
  return useNetworkStore<AccountState>(QueryType.account, defaultAccountState);
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
      isInitialized: true,
      wallets,
      activeWallet: wallet.address,
    };
    const { local } = browser.storage;
    await local.set({ [`${network}_${QueryType.account}`]: value });
    const err = checkForError();
    if (err) {
      throw err;
    }
    await client.resetQueries([network, QueryType.account]);
  });
};

export const useImportWalletMutation = () => {
  const client = useQueryClient();
  const ton = useContext(TonProviderContext);
  const network = useContext(NetworkContext);
  const data = useContext(AccountStateContext);

  return useMutation<void, Error, string>(async (value) => {
    const mnemonic = value.trim().split(" ");
    if (!tonMnemonic.validateMnemonic(mnemonic) || mnemonic.length !== 24) {
      throw new Error("Mnemonic is not valid");
    }

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
    const { local } = browser.storage;
    await local.set({ [`${network}_${QueryType.account}`]: state });
    const err = checkForError();
    if (err) {
      throw err;
    }
    await client.resetQueries([network, QueryType.account]);
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
    const { local } = browser.storage;
    await local.set({ [`${network}_${QueryType.account}`]: value });
    const err = checkForError();
    if (err) {
      throw err;
    }
    await client.resetQueries([network, QueryType.account]);
  });
};
