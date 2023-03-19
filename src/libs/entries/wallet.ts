import { Asset } from "./asset";

export type WalletVersion = "v2R1" | "v2R2" | "v3R1" | "v3R2" | "v4R1" | "v4R2";

export type LedgerDriver = "USB" | "HID";

export interface LedgerState {
  index: number;
  driver: LedgerDriver;
  productId?: string;
  productName?: string;
}

export interface WalletState {
  name: string;
  mnemonic: string;
  address: string;
  publicKey: string;
  version: WalletVersion;
  isBounceable: boolean;

  /**
   * @deprecated use walletAssets
   */
  assets?: Asset[];
  walletAssets?: Record<WalletVersion, Asset[]>;

  ledger?: LedgerState;
}

export const getWalletAssets = (wallet: WalletState): Asset[] => {
  if (wallet.walletAssets && wallet.walletAssets[wallet.version]) {
    return wallet.walletAssets[wallet.version];
  } else {
    return wallet.assets ?? [];
  }
};

export const setWalletAssets = (wallet: WalletState, newAssets: Asset[]) => {
  let { assets, walletAssets, ...rest } = wallet;
  walletAssets = walletAssets ?? ({} as Record<WalletVersion, Asset[]>);
  walletAssets[wallet.version] = newAssets;
  return { ...rest, walletAssets };
};

export interface WalletInfo {
  account_state: string;
  balance: string;
  last_transaction_id: {
    ["@type"]: string;
    hash: string;
    lt: string;
  };
  seqno: number;
  wallet: boolean;
  wallet_id: number;
  wallet_type: string;
}
