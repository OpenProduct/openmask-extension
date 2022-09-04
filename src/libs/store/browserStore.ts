import browser from "webextension-polyfill";
import { AccountState, defaultAccountState } from "../entries/account";
import { Connections, defaultConnections } from "../entries/connection";
import { networkConfigs } from "../entries/network";
import { checkForError } from "../utils";

export enum QueryType {
  price = "price",

  script = "script",
  network = "network",
  connection = "connection",
  tabs = "tabs",

  account = "account",
  balance = "balance",
  address = "address",
  transactions = "transactions",

  estimation = "estimation",

  method = "method",
}

export const getStoreValue = <T>(query: QueryType, defaultValue: T) => {
  const { local } = browser.storage;
  return local.get(query).then<T>((result) => {
    const err = checkForError();
    if (err) {
      throw err;
    }
    return result[query] ?? defaultValue;
  });
};

export const setStoreValue = async <T>(query: QueryType, value: T) => {
  const { local } = browser.storage;
  await local.set({ [query]: value });
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

export const getConnections = () => {
  return getStoreValue<Connections>(QueryType.connection, defaultConnections);
};

export const getAccountState = (network?: string) => {
  return getNetworkStoreValue<AccountState>(
    QueryType.account,
    defaultAccountState,
    network
  );
};

export const setAccountState = (value: AccountState, network?: string) => {
  return setNetworkStoreValue<AccountState>(QueryType.account, value, network);
};

export const setConnections = (value: Connections) => {
  return setStoreValue(QueryType.connection, value);
};

export const getNetworkStoreValue = async <T>(
  query: QueryType,
  defaultValue: T,
  networkValue?: string
) => {
  const network = networkValue ?? (await getNetwork());
  const { local } = browser.storage;
  return local.get(`${network}_${query}`).then<T>((result) => {
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
  network?: string
) => {
  const { local } = browser.storage;
  await local.set({ [`${network}_${query}`]: value });
  const err = checkForError();
  if (err) {
    throw err;
  }
};
