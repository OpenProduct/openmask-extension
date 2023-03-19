import { ALL } from "@openproduct/web-sdk";
import { Asset } from "./asset";

export type WalletVersion = keyof typeof ALL;

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
  assets?: Asset[];

  ledger?: LedgerState;
}

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
