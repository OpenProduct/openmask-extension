import { useMutation } from "@tanstack/react-query";
import { decrypt } from "../../../libs/service/cryptoService";
import { getScript } from "../../../libs/store/browserStore";
import { sendBackground } from "../../event";

export const useUnlockMutation = () => {
  return useMutation<void, Error, string>(async (value) => {
    const script = await getScript();
    if (script == null) {
      throw new Error("Password not set");
    }

    const password = await decrypt(script, value);
    if (password !== value) {
      throw new Error("Invalid password");
    }
    sendBackground.message("tryToUnlock", value);
  });
};
