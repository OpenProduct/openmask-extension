import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import browser from "webextension-polyfill";
import { AccountState, defaultAccountState } from "../libs/entries/account";
import { UnfinishedOperation } from "../libs/event";
import { Logger } from "../libs/logger";
import { popUpInternalEventEmitter } from "../libs/popUpEvent";
import { delay } from "../libs/state/accountService";
import {
  QueryType,
  getAuthConfiguration,
  getLockScreen,
  getNetwork,
  getNetworkConfig,
  getNetworkStoreValue,
  getScript,
  setStoreValue,
} from "../libs/store/browserStore";
import { checkForError } from "../libs/utils";
import { askBackground, uiEventEmitter } from "./event";
import { AppRoute } from "./routes";
import { JettonRoute } from "./screen/home/wallet/assets/jetton/route";
import { NftItemRoute } from "./screen/home/wallet/assets/nft/router";
import { AssetRoutes } from "./screen/home/wallet/assets/route";
import { askBackgroundPassword } from "./screen/import/api";

export const useNetworkConfig = () => {
  return useQuery([QueryType.networkConfig], () => getNetworkConfig(), {
    staleTime: 1800000,
  });
};

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
  const [lock, setLock] = useState<boolean | undefined>(undefined);
  useEffect(() => {
    getLockScreen().then((lock) => {
      if (lock) {
        askBackground<boolean>()
          .message("isLock")
          .then((value) => setLock(value));
      } else {
        setLock(false);
      }
    });
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

export const useInitialRedirect = (
  notification: boolean,
  walletAddress?: string
) => {
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
        if (operation == null) {
          return;
        }

        Logger.log(operation);

        if (operation.kind === "send") {
          const { params, wallet } = operation.value;
          if (wallet !== walletAddress) {
            return;
          }

          navigate(
            `${AppRoute.send}?${new URLSearchParams(params).toString()}`
          );
        } else if (operation.kind === "sendJetton") {
          const { minterAddress, params, wallet } = operation.value;
          if (wallet !== walletAddress) {
            return;
          }
          const page = [
            AppRoute.assets,
            AssetRoutes.jettons,
            `/${encodeURIComponent(minterAddress)}`,
            JettonRoute.send,
          ].join("");

          navigate(`${page}?${new URLSearchParams(params).toString()}`);
        } else if (operation.kind === "sendNft") {
          const { wallet, collectionAddress, address, params } =
            operation.value;

          if (wallet !== walletAddress) {
            return;
          }

          const page = [
            AppRoute.assets,
            AssetRoutes.nfts,
            `/${encodeURIComponent(collectionAddress)}`,
            `/${encodeURIComponent(address)}`,
            NftItemRoute.send,
          ].join("");

          navigate(`${page}?${new URLSearchParams(params).toString()}`);
        }
      });
  }, []);
};

export const getAppPassword = async <R>(
  useAction: (password: string) => Promise<R>
) => {
  const config = await getAuthConfiguration();
  if (config.kind === "password") {
    const password = await askBackgroundPassword().catch(() => null);
    if (password !== null) {
      return await useAction(password);
    } else {
      return await getPasswordByNotification(useAction);
    }
  } else {
    return await getWebAuthnPassword(useAction);
  }
};

export const getPasswordByNotification = async <R>(
  useAction: (password: string) => Promise<R>
) => {
  const id = Date.now();
  return new Promise<R>((resolve, reject) => {
    popUpInternalEventEmitter.emit("getPassword", {
      method: "getPassword",
      id,
      params: undefined,
    });

    const onCallback = (message: {
      method: "response";
      id?: number | undefined;
      params: string | Error;
    }) => {
      if (message.id === id) {
        const { params } = message;
        popUpInternalEventEmitter.off("response", onCallback);

        if (typeof params === "string") {
          Promise.all([useAction(params), delay(500)])
            .then(([result]) => resolve(result))
            .catch((e) => reject(e));
        } else {
          reject(params);
        }
      }
    };

    popUpInternalEventEmitter.on("response", onCallback);
  });
};

export const getWebAuthnPassword = async <R>(
  useAction: (password: string) => Promise<R>
) => {
  const id = Date.now();
  return new Promise<R>((resolve, reject) => {
    popUpInternalEventEmitter.emit("getWebAuthn", {
      method: "getWebAuthn",
      id,
      params: undefined,
    });

    const onCallback = (message: {
      method: "response";
      id?: number | undefined;
      params: string | Error;
    }) => {
      if (message.id === id) {
        const { params } = message;
        popUpInternalEventEmitter.off("response", onCallback);

        if (typeof params === "string") {
          Promise.all([useAction(params), delay(500)])
            .then(([result]) => resolve(result))
            .catch((e) => reject(e));
        } else {
          reject(params);
        }
      }
    };

    popUpInternalEventEmitter.on("response", onCallback);
  });
};
