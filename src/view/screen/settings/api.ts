import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AuthConfiguration } from "../../../libs/entries/auth";
import {
  createCustomNetworkConfig,
  NetworkConfig,
  replaceNetworkConfig,
  selectNetworkConfig,
} from "../../../libs/entries/network";
import {
  DisabledProxyConfiguration,
  ProxyConfiguration,
  ProxyHost,
} from "../../../libs/entries/proxy";
import {
  getAnalytics,
  getAuthConfiguration,
  getLockScreen,
  getProxyConfiguration,
  QueryType,
  setAnalytics,
  setLockScreen,
  setNetworkConfig,
  setProxyConfiguration,
} from "../../../libs/store/browserStore";
import { NetworksContext } from "../../context";
import { sendBackground } from "../../event";

export const useLockScreen = () => {
  return useQuery<boolean, Error>([QueryType.lock], () => getLockScreen());
};

export const useSetLockScreen = () => {
  const client = useQueryClient();
  return useMutation<void, Error, boolean>(async (value) => {
    await setLockScreen(value);
    await client.invalidateQueries([QueryType.lock]);
  });
};

export const useDataCollection = () => {
  return useQuery<boolean, Error>([QueryType.analytics], () => getAnalytics());
};

export const useSetDataCollection = () => {
  const client = useQueryClient();
  return useMutation<void, Error, boolean>(async (value) => {
    await setAnalytics(value);
    await client.invalidateQueries([QueryType.analytics]);
  });
};

export const useAuthConfiguration = () => {
  return useQuery<AuthConfiguration, Error>([QueryType.auth], () =>
    getAuthConfiguration()
  );
};

export const useProxyConfiguration = () => {
  return useQuery<ProxyConfiguration, Error>([QueryType.proxy], () =>
    getProxyConfiguration()
  );
};

export const useUpdateProxyMutation = () => {
  const client = useQueryClient();

  return useMutation<void, Error, ProxyHost | undefined>(async (host) => {
    const configuration = !host
      ? DisabledProxyConfiguration
      : {
          enabled: true,
          domains: {
            ton: host,
          },
        };

    await setProxyConfiguration(configuration);

    sendBackground.message("proxyChanged", configuration);

    await client.invalidateQueries([QueryType.proxy]);
  });
};

export const useNetworkMutation = (networkName: string) => {
  const client = useQueryClient();
  const networks = useContext(NetworksContext);

  return useMutation<void, Error, Partial<NetworkConfig>>(async (config) => {
    const current = selectNetworkConfig(networkName, networks);
    if ("isCustom" in config) {
      const nextConfig = config.isCustom
        ? createCustomNetworkConfig(current)
        : selectNetworkConfig(networkName);
      await setNetworkConfig(replaceNetworkConfig(nextConfig, networks));
    } else {
      const nextConfig = { ...current, ...config };
      await setNetworkConfig(replaceNetworkConfig(nextConfig, networks));
    }

    await client.invalidateQueries([QueryType.networkConfig]);
  });
};
