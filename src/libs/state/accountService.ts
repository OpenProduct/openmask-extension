import * as tonMnemonic from "tonweb-mnemonic";
import { AccountState } from "../entries/account";
import { decrypt, encrypt } from "../service/cryptoService";

export const validateMnemonic = (mnemonic: string[]) => {
  if (!tonMnemonic.validateMnemonic(mnemonic) || mnemonic.length !== 24) {
    throw new Error("Mnemonic is not valid");
  }
};

export const decryptMnemonic = async (mnemonic: string, password: string) => {
  const worlds = await decrypt(mnemonic, password);
  validateMnemonic(worlds.split(" "));
  return worlds;
};

export const reEncryptWallets = async (
  account: AccountState,
  oldPassword: string,
  newPassword: string
): Promise<AccountState> => {
  return {
    ...account,
    wallets: await Promise.all(
      account.wallets.map(async (wallet) => {
        const mnemonic = await decryptMnemonic(wallet.mnemonic, oldPassword);
        return {
          ...wallet,
          mnemonic: await encrypt(mnemonic, newPassword),
        };
      })
    ),
  };
};

export const delay = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
