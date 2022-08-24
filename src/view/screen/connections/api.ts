import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getStoreValue,
  QueryType,
  setConnections,
} from "../../../libs/browserStore";
import {
  Connections,
  defaultConnections,
} from "../../../libs/entries/connection";

export const useConnections = () => {
  return useQuery([QueryType.connection], () =>
    getStoreValue<Connections>(QueryType.connection, defaultConnections)
  );
};

export const useDisconnectMutation = (connections: Connections | undefined) => {
  const client = useQueryClient();
  return useMutation<void, Error, string>(async (origin) => {
    if (!connections) return;

    delete connections[origin];

    const updated = await setConnections(connections);
    client.setQueryData([QueryType.connection], { ...updated });
  });
};
