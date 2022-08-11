import { useCallback } from "react";
import { QueryType, useMutateNetworkStore, useNetworkStore } from "./";
import { useTonProvider } from "./network";
import { createWallet, WalletState } from "./wallet";

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
    const wallet = await createWallet(ton);
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
