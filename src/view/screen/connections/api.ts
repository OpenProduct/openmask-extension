import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import {
  Connections,
  defaultConnections,
} from "../../../libs/entries/connection";
import { revokeDAppAccess } from "../../../libs/state/connectionSerivce";
import {
  getNetworkStoreValue,
  QueryType,
  setConnections,
} from "../../../libs/store/browserStore";
import { NetworkContext } from "../../context";

export const useConnections = () => {
  const network = useContext(NetworkContext);
  return useQuery([network, QueryType.connection], () =>
    getNetworkStoreValue<Connections>(
      QueryType.connection,
      defaultConnections,
      network
    )
  );
};

type Params = {
  origin: string;
  wallet: string;
};
export const useDisconnectMutation = (connections: Connections | undefined) => {
  const network = useContext(NetworkContext);
  const client = useQueryClient();
  return useMutation<void, Error, Params>(async ({ origin, wallet }) => {
    if (!connections) return;

    connections = revokeDAppAccess(connections, origin, wallet);

    await setConnections(connections, network);
    client.invalidateQueries([network, QueryType.connection]);
  });
};
