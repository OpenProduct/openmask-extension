import { Address } from "@ton/core";
import { backgroundEventsEmitter } from "../event";
import { ErrorCode, RuntimeError } from "../exception";
import { Logger } from "../logger";
import { delay, retry } from "../state/accountService";
import {
  getAccountState,
  getConnections,
  getNetwork,
} from "../store/browserStore";
import { getBackgroundTonClient } from "./tonService";
import { AnyWallet } from "./transfer/core";

export const getActiveWallet = async () => {
  const network = await getNetwork();
  const { activeWallet } = await getAccountState(network);

  if (!activeWallet) {
    throw new RuntimeError(
      ErrorCode.unexpectedParams,
      "Unexpected active wallet"
    );
  }
  return activeWallet;
};

export const confirmWalletSeqNo = async (
  walletSeqNo: number,
  activeWallet: string
) => {
  const client = await getBackgroundTonClient();

  const wallet = client.open(
    AnyWallet.createFromAddress(Address.parse(activeWallet))
  );

  let currentSeqNo = await retry(wallet.getSeqno);
  if (currentSeqNo > walletSeqNo) {
    return;
  }
  if (walletSeqNo !== currentSeqNo) {
    throw new RuntimeError(ErrorCode.unexpectedParams, "Unexpected SeqNo");
  }

  do {
    await delay(4000);

    try {
      currentSeqNo = await wallet.getSeqno();
    } catch (e) {
      Logger.error(e);
    }
  } while (currentSeqNo <= walletSeqNo);

  backgroundEventsEmitter.emit("accountsChanged", {
    method: "accountsChanged",
    params: [activeWallet],
  });
};

export const getWalletsByOrigin = async (origin: string, network: string) => {
  const whitelist = await getConnections(network);
  const account = whitelist[origin];
  if (account == null) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      `Origin "${origin}" is not in whitelist`
    );
  }

  const wallets = Object.keys(account.connect);
  if (wallets.length === 0) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      `Origin "${origin}" don't have access to wallets for "${network}"`
    );
  }
  return wallets;
};
