export interface NetworkConfig {
  name: string;
  rpcUrl: string;
  apiKey?: string;
  scanUrl: string;
  rootDnsAddress: string;
}

// Need to get this address from network Config #4
const testnetRootDnsAddress =
  "Ef_v5x0Thgr6pq6ur2NvkWhIf4DxAxsL-Nk5rknT6n99oPKX";
const mainnetRootDnsAddress =
  "Ef-OJd0IF0yc0xkhgaAirq12WawqnUoSuE9RYO3S7McG6lDh";

export const networkConfigs: NetworkConfig[] = [
  {
    name: "mainnet", // aka chainId
    rpcUrl: "https://toncenter.com/api/v2/jsonRPC",
    apiKey: process.env.REACT_APP_TONCENTER_API_KEY,
    scanUrl: "https://tonscan.org",
    rootDnsAddress: mainnetRootDnsAddress,
  },
  {
    name: "testnet", // aka chainId
    rpcUrl: "https://testnet.toncenter.com/api/v2/jsonRPC",
    apiKey: process.env.REACT_APP_TONCENTER_TESTNET_API_KEY,
    scanUrl: "https://testnet.tonscan.org",
    rootDnsAddress: testnetRootDnsAddress,
  },
];

export const getNetworkConfig = (network?: string) => {
  const result = networkConfigs.find((item) => item.name === network);
  return result ?? networkConfigs[0];
};
