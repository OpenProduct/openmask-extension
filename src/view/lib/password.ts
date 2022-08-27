import { decrypt } from "../../libs/cryptoService";
import { validateMnemonic } from "./state/account";

export const decryptMnemonic = async (mnemonic: string, password: string) => {
  const worlds = await decrypt(mnemonic, password);
  validateMnemonic(worlds.split(" "));
  return worlds;
};
