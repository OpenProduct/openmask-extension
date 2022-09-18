/**
 * Service methods and subscription to handle DApp events
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

import HttpProvider from "@openmask/web-sdk/build/providers/httpProvider";
import browser from "webextension-polyfill";
import { Connections } from "../entries/connection";
import { DAppMessage } from "../entries/message";
import { getNetworkConfig } from "../entries/network";
import { Permission } from "../entries/permission";
import { backgroundEventsEmitter } from "../event";
import { ClosePopUpError, ErrorCode, RuntimeError } from "../exception";
import { Logger } from "../logger";
import { getConnections, getNetwork } from "../store/browserStore";
import memoryStore from "../store/memoryStore";
import { showAsset } from "./dApp/assetService";
import { switchChain } from "./dApp/networkService";
import {
  closeCurrentPopUp,
  openConnectDAppPopUp,
  openConnectUnlockPopUp,
} from "./dApp/notificationService";
import { sendTransaction } from "./dApp/transactionService";
import {
  getDAppPermissions,
  getWalletsByOrigin,
  waitApprove,
} from "./dApp/utils";
import { confirmWalletSeqNo } from "./walletService";

const getBalance = async (origin: string, wallet: string | undefined) => {
  const network = await getNetwork();
  const config = getNetworkConfig(network);

  const provider = new HttpProvider(config.rpcUrl, {
    apiKey: config.apiKey,
  });

  if (wallet) {
    const result = await provider.getBalance(wallet);
    Logger.log({ result });
    return result;
  }

  const [first] = await getWalletsByOrigin(origin, network);
  const result = await provider.getBalance(first);
  Logger.log({ result });
  return result;
};

const getConnectedWallets = async (origin: string, network: string) => {
  if (memoryStore.isLock()) {
    const permissions = await getDAppPermissions(network, origin);

    if (!permissions.includes(Permission.locked)) {
      throw new RuntimeError(ErrorCode.unauthorize, `Application locked`);
    }
  }

  return await getWalletsByOrigin(origin, network);
};

const waitUnlock = (popupId?: number) => {
  return new Promise((resolve, reject) => {
    const close = (options: { params: number }) => {
      if (popupId === options.params) {
        backgroundEventsEmitter.off("closedPopUp", close);
        backgroundEventsEmitter.off("unlock", unlock);
        reject(new ClosePopUpError());
      }
    };

    const unlock = () => {
      backgroundEventsEmitter.off("unlock", unlock);
      resolve(undefined);
    };

    backgroundEventsEmitter.on("unlock", unlock);
    backgroundEventsEmitter.on("closedPopUp", close);
  });
};

const connectDApp = async (id: number, origin: string, isEvent: boolean) => {
  const network = await getNetwork();
  if (!isEvent) {
    return await getConnectedWallets(origin, network);
  }
  const whitelist = await getConnections();
  if (whitelist[origin] == null) {
    const popupId = await openConnectDAppPopUp(id, origin);
    try {
      await waitApprove(id, popupId);
    } finally {
      await closeCurrentPopUp(popupId);
    }
  }
  if (memoryStore.isLock()) {
    const permissions = await getDAppPermissions(network, origin);
    if (!permissions.includes(Permission.locked)) {
      const popupId = await openConnectUnlockPopUp();
      try {
        await waitUnlock(popupId);
      } finally {
        await closeCurrentPopUp(popupId);
      }
    }
  }
  return await getConnectedWallets(origin, network);
};

export const handleDAppMessage = async (
  message: DAppMessage
): Promise<unknown> => {
  const origin = decodeURIComponent(message.origin);

  switch (message.method) {
    case "ping": {
      return "pong";
    }

    case "ton_getBalance": {
      return getBalance(origin, message.params[0]);
    }
    case "wallet_requestAccounts":
    case "ton_requestAccounts": {
      return connectDApp(message.id, origin, message.event);
    }
    case "ton_sendTransaction": {
      return sendTransaction(message.id, origin, message.params[0]);
    }
    case "ton_confirmWalletSeqNo": {
      return confirmWalletSeqNo(message.params[0]);
    }

    case "wallet_getLocked": {
      return memoryStore.isLock();
    }
    case "wallet_getChain": {
      return getNetwork();
    }
    case "wallet_switchChain": {
      return switchChain(message.id, origin, message.event, message.params[0]);
    }

    case "wallet_watchAsset": {
      return showAsset(message.id, origin, message.event, message.params[0]);
    }

    case "ton_getAccounts": {
      return getConnectedWallets(origin, await getNetwork());
    }
    default:
      throw new RuntimeError(
        ErrorCode.unexpectedParams,
        `Method "${message.method}" not implemented`
      );
  }
};

export const seeIfTabHaveAccess = (
  port: browser.Runtime.Port,
  connections: Connections,
  accounts: string[]
) => {
  if (!port.sender || !port.sender.url) {
    return false;
  }
  const url = new URL(port.sender.url);
  if (!connections[url.origin]) {
    return false;
  }
  const wallets = Object.keys(connections[url.origin].connect);
  return wallets.includes(accounts[0]);
};
