import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import * as tonMnemonic from "tonweb-mnemonic";
import browser from "webextension-polyfill";
import { checkForError } from "../utils";
import {
  QueryType,
  useMutateNetworkStore,
  useNetwork,
  useNetworkStore,
} from "./";
import { useTonProvider } from "./network";
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
  const ton = useTonProvider();
  const { data } = useAccountState();
  const { mutateAsync, reset } = useMutateNetworkStore<AccountState>(
    QueryType.account
  );

  return useCallback(async () => {
    if (!data) return;
    const wallet = await createWallet(ton, data.wallets.length + 1);
    const wallets = data.wallets.concat([wallet]);
    await mutateAsync({
      ...data,
      isInitialized: true,
      wallets,
      activeWallet: wallet.address,
    });
    reset();
  }, [ton, mutateAsync, reset, data]);
};

export const useImportWalletMutation = () => {
  const client = useQueryClient();
  const ton = useTonProvider();
  const { data: network } = useNetwork();
  const { data } = useAccountState();

  return useMutation<void, Error, string>(async (value: string) => {
    if (!data) {
      throw new Error("Missing data");
    }
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
  const { data } = useAccountState();
  const { mutateAsync, reset } = useMutateNetworkStore<AccountState>(
    QueryType.account
  );
  return useCallback(
    async (address: string) => {
      if (!data) return;

      await mutateAsync({
        ...data,
        activeWallet: address,
      });
      reset();
    },
    [data, reset, mutateAsync]
  );
};
