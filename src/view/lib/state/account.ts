import { QueryClient } from "@tanstack/react-query";
import * as tonMnemonic from "tonweb-mnemonic";
import browser from "webextension-polyfill";
import {
  AccountState,
  defaultAccountState,
} from "../../../libs/entries/account";
import { QueryType } from "../../../libs/store/browserStore";
import { checkForError } from "../../../libs/utils";
import { useNetworkStore } from "../../api";

export const useAccountState = () => {
  return useNetworkStore<AccountState>(QueryType.account, defaultAccountState);
};

export const saveAccountState = async (
  network: string,
  client: QueryClient,
  value: AccountState
) => {
  const { local } = browser.storage;
  await local.set({ [`${network}_${QueryType.account}`]: value });
  const err = checkForError();
  if (err) {
    throw err;
  }
  client.setQueryData([network, QueryType.account], value);
  await client.invalidateQueries([network, value.activeWallet]);
};

export const validateMnemonic = (mnemonic: string[]) => {
  if (!tonMnemonic.validateMnemonic(mnemonic) || mnemonic.length !== 24) {
    throw new Error("Mnemonic is not valid");
  }
};
