import { QueryClient } from "@tanstack/react-query";
import BigNumber from "bignumber.js";
import BN from "bn.js";
import * as tonMnemonic from "tonweb-mnemonic";
import browser from "webextension-polyfill";
import { AccountState } from "../../libs/entries/account";
import { WalletState } from "../../libs/entries/wallet";
import { ErrorCode, RuntimeError } from "../../libs/exception";
import { decryptMnemonic } from "../../libs/state/accountService";
import { QueryType } from "../../libs/store/browserStore";
import { checkForError } from "../../libs/utils";
import { getAppPassword } from "../api";

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

export const checkBalanceOrDie = (
  balance: string | BN | undefined,
  amount: BN
) => {
  if (balance) {
    if (new BN(balance).cmp(amount) === -1) {
      throw new RuntimeError(
        ErrorCode.unexpectedParams,
        "Don't enough wallet balance"
      );
    }
  }
};

const createBigNumber = (value: BigNumber.Value | bigint) => {
  return new BigNumber(typeof value === "bigint" ? value.toString() : value);
};

export const checkBalanceOrDie2 = (
  balance: BigNumber.Value | bigint | undefined,
  amount: BigNumber.Value | bigint
) => {
  if (balance) {
    if (createBigNumber(balance).comparedTo(createBigNumber(amount)) === -1) {
      throw new RuntimeError(
        ErrorCode.unexpectedParams,
        "Don't enough wallet balance"
      );
    }
  }
};

export const getWalletKeyPair = async (wallet: WalletState) => {
  return getAppPassword(async (password) => {
    const mnemonic = await decryptMnemonic(wallet.mnemonic, password);
    return await tonMnemonic.mnemonicToKeyPair(mnemonic.split(" "));
  });
};
