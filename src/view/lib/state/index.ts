import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import browser from "webextension-polyfill";
import {
  getNetwork,
  getNetworkStoreValue,
  getStoreValue,
  QueryType,
} from "../../../libs/browserStore";
import { checkForError } from "../../../libs/utils";

export const useMutateStore = <T>(query: QueryType) => {
  const client = useQueryClient();
  return useMutation<void, Error, T>(async (value) => {
    const { local } = browser.storage;
    await local.set({ [query]: value });
    const err = checkForError();
    if (err) {
      throw err;
    }
    client.setQueryData([query], value);
  });
};

export const useStore = <T>(query: QueryType, defaultValue: T) => {
  return useQuery<T>([query], () => {
    return getStoreValue(query, defaultValue);
  });
};

export const useNetwork = () => {
  return useQuery([QueryType.network], () => getNetwork());
};

export const useNetworkStore = <T>(query: QueryType, defaultValue: T) => {
  const { data: network } = useNetwork();
  return useQuery<T>(
    [network, query],
    () => getNetworkStoreValue(query, defaultValue, network),
    {
      enabled: network != null,
    }
  );
};

export const useMutateNetworkStore = <T>(query: QueryType) => {
  const client = useQueryClient();
  const { data: network } = useNetwork();
  return useMutation<void, Error, T>(async (value) => {
    const { local } = browser.storage;
    await local.set({ [`${network}_${query}`]: value });
    const err = checkForError();
    if (err) {
      throw err;
    }
    await client.resetQueries([network, query]);
  });
};
