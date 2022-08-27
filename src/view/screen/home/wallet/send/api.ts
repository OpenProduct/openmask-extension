import { useMutation } from "@tanstack/react-query";

export interface State {
  address: string;
  amount: string;
  max: string;
  comment: string;
}

export const useSendMutation = () => {
  return useMutation<void, Error, State>(async (state) => {});
};
