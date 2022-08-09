import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import browser from "webextension-polyfill";
import { checkForError } from "../utils";

export enum QueryType {
  network = "network",
  account = "account",
}

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
    const { local } = browser.storage;
    return local.get(query).then<T>((result) => {
      const err = checkForError();
      if (err) {
        throw err;
      }
      return result[query] ?? defaultValue;
    });
  });
};

export const useNetwork = () => {
  return useStore<string>(QueryType.network, "Mainnet");
};

export const useNetworkStore = <T>(query: QueryType, defaultValue: T) => {
  const { data: network } = useNetwork();
  return useQuery<T>(
    [query, network],
    () => {
      const { local } = browser.storage;
      return local.get(`${query}_${network}`).then<T>((result) => {
        const err = checkForError();
        if (err) {
          throw err;
        }
        return result[`${query}_${network}`] ?? defaultValue;
      });
    },
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
    await local.set({ [`${query}_${network}`]: value });
    const err = checkForError();
    if (err) {
      throw err;
    }
    await client.resetQueries([query, network]);
  });
};
