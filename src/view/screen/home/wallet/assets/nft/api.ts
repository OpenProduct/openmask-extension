import { useMutation } from "@tanstack/react-query";

export const useHideNftMutation = () => {
  return useMutation<void, Error, string>(async (address) => {
    address;
    return;
  });
};
