import { TonHttpProvider } from "@openproduct/web-sdk";
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

export const checkBalanceOrDie2 = (
  balance: BigNumber.Value | undefined,
  amount: BigNumber.Value
) => {
  if (balance) {
    if (new BigNumber(balance).comparedTo(amount) === -1) {
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

export const getPublicKey = async (
  ton: TonHttpProvider,
  address: string
): Promise<string> => {
  const walletPubKeyBN = await ton.call2(address, "get_public_key");
  let walletPubKeyHex = walletPubKeyBN.toString(16);
  if (walletPubKeyHex.length % 2 !== 0) {
    walletPubKeyHex = "0" + walletPubKeyHex;
  }
  return walletPubKeyHex;
};
