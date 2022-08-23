import { WalletState } from "./wallet";

export interface AccountState {
  wallets: WalletState[];
  activeWallet?: string;
}

export const defaultAccountState: AccountState = {
  wallets: [],
};
