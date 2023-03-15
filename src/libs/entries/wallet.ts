import { ALL } from "@openproduct/web-sdk";
import { Asset } from "./asset";

export type WalletVersion = keyof typeof ALL;

export interface WalletState {
  name: string;
  mnemonic: string;
  address: string;
  publicKey: string;
  version: WalletVersion;
  isBounceable: boolean;
  assets?: Asset[];

  isLadger?: boolean;
  ladgerIndex?: number;
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
