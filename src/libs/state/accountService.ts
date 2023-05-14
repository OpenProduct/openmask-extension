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
        if (wallet.mnemonic === "") return wallet;

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

export interface RetryConfig {
  retries: number;
  delay: number;
}

const defaultConfig: RetryConfig = {
  retries: 3,
  delay: 60,
};

export async function retry<T>(
  f: () => Promise<T>,
  config: RetryConfig = defaultConfig
): Promise<T> {
  let lastError: Error;

  let retries: number = config.retries;

  for (let i = 0; i <= retries; i++) {
    try {
      const result = await f();
      return result;
    } catch (error) {
      lastError = error as Error;
    }
    await delay(Math.pow(i + 1, config.delay));
  }
  throw new Error(`All retries failed. Last error: ${lastError!}`, lastError!);
}
