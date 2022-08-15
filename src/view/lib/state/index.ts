import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import browser from "webextension-polyfill";
import { checkForError } from "../utils";

export enum QueryType {
  price = "price",
  network = "network",
  account = "account",
  balance = "balance",
  address = "address",
  transactions = "transactions",
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
    [network, query],
    () => {
      const { local } = browser.storage;
      return local.get(`${network}_${query}`).then<T>((result) => {
        const err = checkForError();
        if (err) {
          throw err;
        }
        return result[`${network}_${query}`] ?? defaultValue;
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
    await local.set({ [`${network}_${query}`]: value });
    const err = checkForError();
    if (err) {
      throw err;
    }
    await client.resetQueries([network, query]);
  });
};
