import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import {
  TonConnectItemReply,
  TonConnectRequest,
} from "../../../../libs/entries/notificationMessage";
import {
  getConnections,
  setConnections,
} from "../../../../libs/store/browserStore";
import { NetworkContext } from "../../../context";
import { sendBackground } from "../../../event";

interface ConnectParams {
  origin: string;
  wallet: string;
  id: number;
  logo: string | null;
  data: TonConnectRequest;
}

export const useAddConnectionMutation = () => {
  const network = useContext(NetworkContext);
  return useMutation<void, Error, ConnectParams>(
    async ({ origin, wallet, id, logo, data }) => {
      const payload: TonConnectItemReply[] = [];

      const connections = await getConnections(network);

      // addDAppAccess(connections, logo, origin, wallets, permissions);

      await setConnections(connections, network);

      sendBackground.message("approveRequest", { id, payload });
    }
  );
};
