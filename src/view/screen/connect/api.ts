import { useMutation } from "@tanstack/react-query";
import { getConnections, setConnections } from "../../../libs/browserStore";
import { sendBackground } from "../../event";

export const useAddConnectionMutation = () => {
  return useMutation<
    void,
    Error,
    { origin: string; wallets: string[]; id: number }
  >(async ({ origin, wallets, id }) => {
    const connections = await getConnections();

    connections[origin] = { wallets };

    await setConnections(connections);

    sendBackground.message("approveRequest", id);
  });
};
