import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { AccountState, defaultAccountState } from "../libs/entries/account";
import {
  getNetwork,
  getNetworkStoreValue,
  QueryType,
  setStoreValue,
} from "../libs/store/browserStore";
import { checkForError } from "../libs/utils";
import { askBackground, uiEventEmitter } from "./event";

export const useNetwork = () => {
  return useQuery([QueryType.network], () => getNetwork());
};

export const useMutateStore = <T>(query: QueryType) => {
  const client = useQueryClient();
  return useMutation<void, Error, T>(async (value) => {
    await setStoreValue(query, value);
    client.setQueryData([query], value);
  });
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

export const useAccountState = () => {
  return useNetworkStore<AccountState>(QueryType.account, defaultAccountState);
};

export const useLock = () => {
  const [lock, setLock] = useState(true);
  useEffect(() => {
    askBackground<boolean>()
      .message("isLock")
      .then((value) => setLock(value));

    const unlock = () => {
      setLock(false);
    };
    const locked = () => {
      setLock(true);
    };
    uiEventEmitter.on("unlock", unlock);
    uiEventEmitter.on("locked", locked);

    return () => {
      uiEventEmitter.off("unlock", unlock);
      uiEventEmitter.off("locked", locked);
    };
  }, []);

  return lock;
};
