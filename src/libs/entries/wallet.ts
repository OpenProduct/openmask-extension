import { ALL } from "@openmask/web-sdk";

export type WalletVersion = keyof typeof ALL;

export interface WalletState {
  name: string;
  mnemonic: string;
  address: string;
  publicKey: string;
  version: WalletVersion;
  isBounceable: boolean;
}
