/**
 * Service methods and subscription to handle DApp events
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

import HttpProvider from "@openmask/web-sdk/build/providers/httpProvider";
import browser from "webextension-polyfill";
import { Connections } from "../entries/connection";
import {
  DAppMessage,
  OpenMaskApiEvent,
  OpenMaskApiResponse,
} from "../entries/message";
import { getNetworkConfig } from "../entries/network";
import { backgroundEventsEmitter } from "../event";
import { ErrorCode, RuntimeError } from "../exception";
import { Logger } from "../logger";
import { getConnections, getNetwork } from "../store/browserStore";
import memoryStore from "../store/memoryStore";
import { showAsset } from "./dApp/assetService";
import { connectDApp, getConnectedWallets } from "./dApp/connectService";
import { switchChain } from "./dApp/networkService";
import {
  sendTransaction,
  signPersonalValue,
  signRawValue,
} from "./dApp/transactionService";
import { checkBaseDAppPermission } from "./dApp/utils";
import {
  confirmWalletSeqNo,
  getActiveWallet,
  getWalletsByOrigin,
} from "./walletService";

const getBalance = async (origin: string, wallet: string | undefined) => {
  await checkBaseDAppPermission(origin, wallet);
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

let contentScriptPorts = new Set<browser.Runtime.Port>();

const providerResponse = (
  id: number,
  method: string,
  result: undefined | unknown,
  error?: RuntimeError
): OpenMaskApiResponse => {
  return {
    type: "OpenMaskAPI",
    message: {
      jsonrpc: "2.0",
      id,
      method,
      result,
      error: error
        ? {
            message: error.message,
            code: error.code,
            description: error.description,
          }
        : undefined,
    },
  };
};

const providerEvent = (
  method: "accountsChanged" | "chainChanged",
  result: undefined | unknown
): OpenMaskApiEvent => {
  return {
    type: "OpenMaskAPI",
    message: {
      jsonrpc: "2.0",
      method,
      result,
    },
  };
};

export const handleDAppConnection = (port: browser.Runtime.Port) => {
  contentScriptPorts.add(port);
  port.onMessage.addListener(async (msg, contentPort) => {
    if (msg.type !== "OpenMaskProvider" || !msg.message) {
      return;
    }

    const [result, error] = await handleDAppMessage(msg.message)
      .then((result) => [result, undefined] as const)
      .catch((e: RuntimeError) => [undefined, e] as const);

    Logger.log({ msg, result, error });
    if (contentPort) {
      contentPort.postMessage(
        providerResponse(msg.message.id, msg.message.method, result, error)
      );
    }
  });
  port.onDisconnect.addListener((port) => {
    contentScriptPorts.delete(port);
  });
};

const confirmAccountSeqNo = async (
  origin: string,
  walletSeqNo: number,
  wallet?: string
) => {
  if (!wallet) {
    wallet = await getActiveWallet();
  }
  await checkBaseDAppPermission(origin, wallet);
  return confirmWalletSeqNo(walletSeqNo, wallet);
};

const handleDAppMessage = async (message: DAppMessage): Promise<unknown> => {
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
      return confirmAccountSeqNo(origin, message.params[0], message.params[1]);
    }

    case "ton_rawSign": {
      return signRawValue(message.id, origin, message.params[0]);
    }
    case "ton_personalSign": {
      return signPersonalValue(message.id, origin, message.params[0]);
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

const seeIfTabHaveAccess = (
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

export const subscriptionDAppNotifications = () => {
  backgroundEventsEmitter.on("chainChanged", (message) => {
    contentScriptPorts.forEach((port) => {
      port.postMessage(providerEvent("chainChanged", message.params));
    });
  });

  backgroundEventsEmitter.on("accountsChanged", async (message) => {
    try {
      const connections = await getConnections();
      contentScriptPorts.forEach((port) => {
        const access = seeIfTabHaveAccess(port, connections, message.params);
        if (access) {
          port.postMessage(providerEvent("accountsChanged", message.params));
        }
      });
    } catch (e) {
      Logger.error(e);
    }
  });
};
