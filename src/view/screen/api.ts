import { fromNano } from "@openmask/web-sdk/build/utils/utils";
import { QueryClient } from "@tanstack/react-query";
import * as tonMnemonic from "tonweb-mnemonic";
import browser from "webextension-polyfill";
import { AccountState } from "../../libs/entries/account";
import { decrypt } from "../../libs/service/cryptoService";
import { QueryType } from "../../libs/store/browserStore";
import { checkForError } from "../../libs/utils";

export const saveAccountState = async (
  network: string,
  client: QueryClient,
  value: AccountState
) => {
  await browser.storage.local.set({
    [`${network}_${QueryType.account}`]: value,
  });
  const err = checkForError();
  if (err) {
    throw err;
  }
  client.setQueryData([network, QueryType.account], value);
  await client.invalidateQueries([network, value.activeWallet]);
};

const balanceFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export const numberTonValue = (value: string): number => {
  return parseFloat(fromNano(value));
};

export const formatTonValue = (value: string): string => {
  return balanceFormat.format(numberTonValue(value));
};

export const toShortAddress = (address: string): string => {
  return address.slice(0, 4) + "...." + address.slice(-4);
};

export const toShortName = (name: string): string => {
  if (name.length > 15) {
    return name.slice(0, 15) + "...";
  }
  return name;
};

export const validateMnemonic = (mnemonic: string[]) => {
  if (!tonMnemonic.validateMnemonic(mnemonic) || mnemonic.length !== 24) {
    throw new Error("Mnemonic is not valid");
  }
};

export const decryptMnemonic = async (mnemonic: string, password: string) => {
  const worlds = await decrypt(mnemonic, password);
  validateMnemonic(worlds.split(" "));
  return worlds;
};
