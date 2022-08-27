import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Connections,
  defaultConnections,
} from "../../../libs/entries/connection";
import {
  getStoreValue,
  QueryType,
  setConnections,
} from "../../../libs/store/browserStore";

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

    await setConnections(connections);
    client.invalidateQueries([QueryType.connection]);
  });
};
