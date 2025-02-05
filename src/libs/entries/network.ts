export interface NetworkConfig {
  isCustom?: boolean;
  isDefault: boolean;
  name: string;
  id: TonConnectNETWORK | string;
  rpcUrl: string;
  apiKey?: string;
  scanUrl: string;
  rootDnsAddress: string;
}

export enum TonConnectNETWORK {
  MAINNET = "-239",
  TESTNET = "-3",
}
// Need to get this address from network Config #4
const testnetRootDnsAddress =
  "Ef_v5x0Thgr6pq6ur2NvkWhIf4DxAxsL-Nk5rknT6n99oPKX";
const mainnetRootDnsAddress =
  "Ef-OJd0IF0yc0xkhgaAirq12WawqnUoSuE9RYO3S7McG6lDh";

export const defaultNetworkConfigs: NetworkConfig[] = [
  {
    isDefault: true,
    name: "mainnet", // aka chainId
    id: TonConnectNETWORK.MAINNET,
    rpcUrl: "https://toncenter.com/api/v2/jsonRPC",
    apiKey: process.env.REACT_APP_TONCENTER_API_KEY,
    scanUrl: "https://tonviewer.com/",
    rootDnsAddress: mainnetRootDnsAddress,
  },
  {
    isDefault: true,
    name: "testnet", // aka chainId
    id: TonConnectNETWORK.TESTNET,
    rpcUrl: "https://testnet.toncenter.com/api/v2/jsonRPC",
    apiKey: process.env.REACT_APP_TONCENTER_TESTNET_API_KEY,
    scanUrl: "https://testnet.tonviewer.com/",
    rootDnsAddress: testnetRootDnsAddress,
  },
];

export const selectNetworkConfig = (
  network?: string,
  networks?: NetworkConfig[]
) => {
  const list = networks ?? defaultNetworkConfigs;
  const result = list.find((item) => item.name === network);
  return result ?? list[0];
};

export const replaceNetworkConfig = (
  network: NetworkConfig,
  networks: NetworkConfig[]
) => {
  return networks.map((item) => (item.name === network.name ? network : item));
};

export const createCustomNetworkConfig = (
  network: NetworkConfig
): NetworkConfig => {
  return {
    ...network,
    isCustom: true,
    apiKey: "",
  };
};
