import browser from "webextension-polyfill";
import { Connections, defaultConnections } from "./entries/connection";
import { checkForError } from "./utils";

export enum QueryType {
  price = "price",

  network = "network",
  connection = "connection",
  tabs = "tabs",

  account = "account",
  balance = "balance",
  address = "address",
  transactions = "transactions",

  estimation = "estimation",
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

export const getNetwork = () => {
  return getStoreValue(QueryType.network, "Mainnet");
};

export const getConnections = () => {
  return getStoreValue<Connections>(QueryType.connection, defaultConnections);
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
