import { useMutation, useQueryClient } from "@tanstack/react-query";
import { encrypt } from "../../../libs/service/cryptoService";
import { QueryType, setStoreValue } from "../../../libs/store/browserStore";
import { askBackground } from "../../event";

export const useCreatePasswordMutation = () => {
  const client = useQueryClient();
  return useMutation<void, Error, [string, string]>(
    async ([password, confirm]) => {
      if (password !== confirm) {
        throw new Error("Confirm password incorrect");
      }
      if (password.length <= 5) {
        throw new Error("Password too short");
      }
      const script = await encrypt(password, password);

      await setStoreValue(QueryType.script, script);
      await askBackground<void>().message("setPassword", password);
      await client.invalidateQueries([QueryType.script]);
    }
  );
};
