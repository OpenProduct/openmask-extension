import fetchAdapter from "@vespaiach/axios-fetch-adapter";
import { TonClient } from "ton-wrappers/dist/client/TonClient";
import { selectNetworkConfig } from "../entries/network";
import { getNetwork, getNetworkConfig } from "../store/browserStore";

export const getBackgroundTonClient = async (): Promise<TonClient> => {
  const network = await getNetwork();
  const networks = await getNetworkConfig();
  const config = selectNetworkConfig(network, networks);

  const client = new TonClient({
    endpoint: config.rpcUrl,
    apiKey: config.apiKey,
    httpAdapter: fetchAdapter as any,
  });

  return client;
};
