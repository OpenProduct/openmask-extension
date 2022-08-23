import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { AccountStateContext } from "../../context";
import { sendBackground } from "../../event";
import { decryptMnemonic } from "../../lib/password";

export const useUnlockMutation = () => {
  const data = useContext(AccountStateContext);
  return useMutation<void, Error, string>(async (value) => {
    const [wallet] = data.wallets;
    await decryptMnemonic(wallet.mnemonic, value);
    sendBackground.message("tryToUnlock", value);
  });
};
