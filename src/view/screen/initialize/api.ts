import { useMutation } from "@tanstack/react-query";
import { askBackground } from "../../event";

export const useCreatePasswordMutation = () => {
  return useMutation<void, Error, [string, string]>(
    async ([password, confirm]) => {
      if (password !== confirm) {
        throw new Error("Confirm password incorrect");
      }
      await askBackground<void>().message("setPassword", password);
    }
  );
};
