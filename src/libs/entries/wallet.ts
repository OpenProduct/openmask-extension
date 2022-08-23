import TonWeb from "tonweb";

export type WalletVersion = keyof typeof TonWeb.Wallets.all;

export interface WalletState {
  name: string;
  mnemonic: string;
  address: string;
  publicKey: string;
  version: WalletVersion;
  isBounceable: boolean;
}
