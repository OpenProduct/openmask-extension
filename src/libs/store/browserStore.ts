import browser from "webextension-polyfill";
import { AccountState, defaultAccountState } from "../entries/account";
import { AuthConfiguration, DefaultAuthPasswordConfig } from "../entries/auth";
import { Connections, defaultConnections } from "../entries/connection";
import { networkConfigs } from "../entries/network";
import {
  DisabledProxyConfiguration,
  ProxyConfiguration,
} from "../entries/proxy";
import { checkForError } from "../utils";

export enum QueryType {
  proxy = "proxy",
  auth = "auth",

  price = "price",

  script = "script",
  network = "network",
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

export const getScript = () => {
  return getStoreValue<string | null>(QueryType.script, null);
};

export const getNetwork = () => {
  return getStoreValue(QueryType.network, networkConfigs[0].name);
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

export const getConnections = (network?: string) => {
  return getNetworkStoreValue<Connections>(
    QueryType.connection,
    defaultConnections,
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

export const setProxyConfiguration = (value: ProxyConfiguration) => {
  return setStoreValue(QueryType.proxy, value);
};

export const setAccountState = (value: AccountState, network?: string) => {
  return setNetworkStoreValue<AccountState>(QueryType.account, value, network);
};

export const setConnections = (value: Connections, network?: string) => {
  return setNetworkStoreValue(QueryType.connection, value, network);
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
