import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import {
  Connections,
  defaultConnections,
} from "../../../libs/entries/connection";
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

export const useDisconnectMutation = (connections: Connections | undefined) => {
  const client = useQueryClient();
  return useMutation<void, Error, string>(async (origin) => {
    if (!connections) return;

    delete connections[origin];

    await setConnections(connections);
    client.invalidateQueries([QueryType.connection]);
  });
};
