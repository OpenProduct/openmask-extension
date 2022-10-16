import { QueryClient } from "@tanstack/react-query";
import BN from "bn.js";
import * as tonMnemonic from "tonweb-mnemonic";
import browser from "webextension-polyfill";
import { AccountState } from "../../libs/entries/account";
import { WalletState } from "../../libs/entries/wallet";
import { ErrorCode, RuntimeError } from "../../libs/exception";
import { decryptMnemonic } from "../../libs/state/accountService";
import { QueryType } from "../../libs/store/browserStore";
import { checkForError } from "../../libs/utils";
import { askBackgroundPassword } from "./import/api";

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

export const checkBalanceOrDie = (balance: string | undefined, amount: BN) => {
  if (balance) {
    if (new BN(balance).cmp(amount) === -1) {
      throw new RuntimeError(
        ErrorCode.unexpectedParams,
        "Don't enough wallet balance"
      );
    }
  }
};

export const getWalletKeyPair = async (wallet: WalletState) => {
  const mnemonic = await decryptMnemonic(
    wallet.mnemonic,
    await askBackgroundPassword()
  );
  return await tonMnemonic.mnemonicToKeyPair(mnemonic.split(" "));
};
