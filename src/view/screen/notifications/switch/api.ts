import { useMutation } from "@tanstack/react-query";
import { QueryType, setStoreValue } from "../../../../libs/store/browserStore";
import { sendBackground } from "../../../event";

interface Params {
  network: string;
  id: number;
}
export const useSwitchNetworkMutation = () => {
  return useMutation<void, Error, Params>(async ({ id, network }) => {
    await setStoreValue(QueryType.network, network);

    sendBackground.message("chainChanged", network);
    sendBackground.message("approveRequest", { id, payload: undefined });
  });
};
