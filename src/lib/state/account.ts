import { QueryType, useNetworkStore } from "./";
import { WalletState } from "./wallet";

export interface AccountState {
  isInitialized: boolean;
  isLock: boolean;
  password?: string;
  wallets: WalletState[];
  activeWallet: number;
}

const defaultAccountState: AccountState = {
  isInitialized: false,
  isLock: false,
  wallets: [],
  activeWallet: 0,
};

export const useAccountState = () => {
  return useNetworkStore<AccountState>(QueryType.account, defaultAccountState);
};
