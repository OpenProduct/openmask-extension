import { Access, Network } from "@orbs-network/ton-access";
import browser from "webextension-polyfill";
import { AccountState, defaultAccountState } from "../entries/account";
import {
  AuthConfiguration,
  DefaultAuthPasswordConfig,
  WebAuthn,
} from "../entries/auth";
import { Connections, defaultConnections } from "../entries/connection";
import { defaultNetworkConfigs, NetworkConfig } from "../entries/network";
import {
  DisabledProxyConfiguration,
  ProxyConfiguration,
} from "../entries/proxy";
import { checkForError } from "../utils";

export enum QueryType {
  proxy = "proxy",
  auth = "auth",
  lock = "lock",

  price = "price",
  stock = "stock",

  script = "script",
  network = "network",
  networkConfig = "networkConfig",
  connection = "connection",
  tabs = "tabs",

  account = "account",
  balance = "balance",
  address = "address",
  transactions = "transactions",
  raw = "raw",
  jetton = "jetton",
  origin = "origin",

  estimation = "estimation",

  method = "method",
  encryptedPayload = "encrypted_payload",
  publicKey = "public_key",
  ledger = "ledger",

  analytics = "analytics",
}

export const getStoreValue = <T>(query: QueryType, defaultValue: T) => {
  return browser.storage.local.get(query).then<T>((result) => {
    const err = checkForError();
    if (err) {
      throw err;
    }
    return result[query] ?? defaultValue;
  });
};

export const setStoreValue = async <T>(query: QueryType, value: T) => {
  await browser.storage.local.set({ [query]: value });
  const err = checkForError();
  if (err) {
    throw err;
  }
  return value;
};

export const getLockScreen = () => {
  return getStoreValue<boolean>(QueryType.lock, false);
};

export const setLockScreen = (lock: boolean) => {
  return setStoreValue(QueryType.lock, lock);
};

export const getAnalytics = () => {
  return getStoreValue<boolean>(QueryType.analytics, true);
};

export const setAnalytics = (analytics: boolean) => {
  return setStoreValue(QueryType.analytics, analytics);
};

export const getScript = () => {
  return getStoreValue<string | null>(QueryType.script, null);
};

export const getNetwork = () => {
  return getStoreValue(QueryType.network, defaultNetworkConfigs[0].name);
};

export const getNetworkConfig = async () => {
  const configs = await getStoreValue(
    QueryType.networkConfig,
    defaultNetworkConfigs
  );

  const access = new Access();
  await access.init();

  return configs.map((config) => {
    if (["testnet", "mainnet"].includes(config.name) && !config.isCustom) {
      const [endpoint] = access.buildUrls(
        config.name as Network,
        "toncenter-api-v2",
        "jsonRPC",
        true
      );
      return {
        ...config,
        rpcUrl: endpoint,
        apiKey: undefined,
      };
    } else {
      return config;
    }
  });
};

export const setNetworkConfig = (value: NetworkConfig[]) => {
  return setStoreValue(QueryType.networkConfig, value);
};

export const getProxyConfiguration = () => {
  return getStoreValue<ProxyConfiguration>(
    QueryType.proxy,
    DisabledProxyConfiguration
  );
};

export const getAuthConfiguration = () => {
  return getStoreValue<AuthConfiguration>(
    QueryType.auth,
    DefaultAuthPasswordConfig
  );
};

// Hack to fix bug with empty connect list
const filterConnection = async (
  connection: Connections,
  network?: string
): Promise<Connections> => {
  const account = await getAccountState(network);

  return Object.entries(connection).reduce((acc, [origin, connection]) => {
    // Remove connection from removed wallets
    const wallets = Object.keys(connection.connect).filter((address) => {
      return account.wallets.some((item) => item.address === address);
    });
    if (wallets.length > 0) {
      acc[origin] = connection;
    }
    return acc;
  }, {} as Connections);
};

export const getConnections = async (network?: string) => {
  return filterConnection(
    await getNetworkStoreValue<Connections>(
      QueryType.connection,
      defaultConnections,
      network
    ),
    network
  );
};

export const getAccountState = (network?: string) => {
  return getNetworkStoreValue<AccountState>(
    QueryType.account,
    defaultAccountState,
    network
  );
};

export const updateAuthCounter = (value: WebAuthn, newCounter: number) => {
  return setStoreValue(QueryType.auth, { ...value, counter: newCounter });
};

export const setProxyConfiguration = (value: ProxyConfiguration) => {
  return setStoreValue(QueryType.proxy, value);
};

export const setAccountState = (value: AccountState, network?: string) => {
  return setNetworkStoreValue<AccountState>(QueryType.account, value, network);
};

export const setConnections = async (value: Connections, network?: string) => {
  return setNetworkStoreValue(
    QueryType.connection,
    await filterConnection(value, network),
    network
  );
};

interface BrowserCache<T> {
  timeout: number;
  data: T;
}

const removeCachedStoreValue = async (query: string) => {
  await browser.storage.local.remove(`catch_${query}`);
  const err = checkForError();
  if (err) {
    throw err;
  }
};

export const getCachedStoreValue = async <T>(
  query: string
): Promise<T | null> => {
  return browser.storage.local
    .get(`catch_${query}`)
    .then<T | null>(async (result) => {
      const err = checkForError();
      if (err) {
        throw err;
      }

      const data: BrowserCache<T> | undefined = result[`catch_${query}`];
      if (!data) return null;
      if (data.timeout < Date.now()) {
        await removeCachedStoreValue(query);
        return null;
      } else {
        return data.data;
      }
    });
};

const tenMin = 10 * 60 * 1000;

export const setCachedStoreValue = async <T>(
  query: string,
  data: T,
  timeout: number = Date.now() + tenMin
) => {
  await browser.storage.local.set({ [`catch_${query}`]: { data, timeout } });
  const err = checkForError();
  if (err) {
    throw err;
  }
};

export const getNetworkStoreValue = async <T>(
  query: QueryType,
  defaultValue: T,
  networkValue?: string
) => {
  const network = networkValue ?? (await getNetwork());
  return browser.storage.local.get(`${network}_${query}`).then<T>((result) => {
    const err = checkForError();
    if (err) {
      throw err;
    }
    return result[`${network}_${query}`] ?? defaultValue;
  });
};

export const setNetworkStoreValue = async <T>(
  query: QueryType,
  value: T,
  networkValue?: string
) => {
  const network = networkValue ?? (await getNetwork());
  await browser.storage.local.set({ [`${network}_${query}`]: value });
  const err = checkForError();
  if (err) {
    throw err;
  }
};

export const batchUpdateStore = async (
  values: Record<string, any>
): Promise<void> => {
  await browser.storage.local.set(values);
  const err = checkForError();
  if (err) {
    throw err;
  }
};
