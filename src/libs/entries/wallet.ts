import { ALL } from "@openmask/web-sdk";
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
}
