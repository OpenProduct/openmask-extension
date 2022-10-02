import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DisabledProxyConfiguration,
  ProxyConfiguration,
  ProxyHost,
} from "../../../libs/entries/proxy";
import {
  getProxyConfiguration,
  QueryType,
  setProxyConfiguration,
} from "../../../libs/store/browserStore";
import { sendBackground } from "../../event";

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
