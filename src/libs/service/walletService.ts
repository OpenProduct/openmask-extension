import { TonHttpProvider } from "@openproduct/web-sdk";
import BN from "bn.js";
import { getNetworkConfig } from "../entries/network";
import { backgroundEventsEmitter } from "../event";
import { ErrorCode, RuntimeError } from "../exception";
import { Logger } from "../logger";
import {
  getAccountState,
  getConnections,
  getNetwork,
} from "../store/browserStore";

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
  const network = await getNetwork();
  const config = getNetworkConfig(network);

  const provider = new TonHttpProvider(config.rpcUrl, {
    apiKey: config.apiKey,
  });

  const bn: BN = await provider.call2(activeWallet, "seqno");
  let currentSeqNo = bn.toNumber();
  if (walletSeqNo === currentSeqNo - 1) {
    return;
  }
  if (walletSeqNo !== currentSeqNo) {
    throw new RuntimeError(ErrorCode.unexpectedParams, "Unexpected SeqNo");
  }

  do {
    await new Promise((resolve) => setTimeout(resolve, 4000));

    try {
      const bn: BN = await provider.call2(activeWallet, "seqno");
      currentSeqNo = bn.toNumber();
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
