import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";
import { AccountState, defaultAccountState } from "../libs/entries/account";
import { UnfinishedOperation } from "../libs/event";
import { Logger } from "../libs/logger";
import {
  getNetwork,
  getNetworkStoreValue,
  getScript,
  QueryType,
  setStoreValue,
} from "../libs/store/browserStore";
import { checkForError } from "../libs/utils";
import { askBackground, uiEventEmitter } from "./event";
import { AppRoute } from "./routes";
import { JettonRoute } from "./screen/home/wallet/assets/jetton/route";
import { NftItemRoute } from "./screen/home/wallet/assets/nft/router";
import { AssetRoutes } from "./screen/home/wallet/assets/route";

export const useNetwork = () => {
  return useQuery([QueryType.network], () => getNetwork());
};

export const useScript = () => {
  return useQuery([QueryType.script], () => getScript());
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
    await browser.storage.local.set({ [`${network}_${query}`]: value });
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

export const useInitialRedirect = (notification: boolean) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash) {
      Logger.log(window.location.hash);
      navigate(window.location.hash.substring(1));
    }
  }, []);

  useEffect(() => {
    if (notification) return;

    askBackground<UnfinishedOperation>()
      .message("getOperation")
      .then((operation) => {
        if (operation !== null) {
          Logger.log(operation);

          if (operation.kind === "send") {
            navigate(
              `${AppRoute.send}?${new URLSearchParams(
                JSON.parse(operation.value)
              ).toString()}`
            );
          } else if (operation.kind === "sendJetton") {
            const { minterAddress, params } = operation.value;

            const page = [
              AppRoute.assets,
              AssetRoutes.jettons,
              `/${encodeURIComponent(minterAddress)}`,
              JettonRoute.send,
            ].join("");

            navigate(`${page}?${new URLSearchParams(params).toString()}`);
          } else if (operation.kind === "sendNft") {
            const { collectionAddress, address, params } = operation.value;

            const page = [
              AppRoute.assets,
              AssetRoutes.nfts,
              `/${encodeURIComponent(collectionAddress)}`,
              `/${encodeURIComponent(address)}`,
              NftItemRoute.send,
            ].join("");

            navigate(`${page}?${new URLSearchParams(params).toString()}`);
          }
        }
      });
  }, []);
};
