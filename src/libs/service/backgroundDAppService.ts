/**
 * Service methods and subscription to handle DApp events
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

import { Address } from "@ton/core";
import Joi from "joi";
import browser from "webextension-polyfill";
import {
  AssetParams,
  JettonParamsSchema,
  NftParamsSchema,
} from "../entries/asset";
import { Connections } from "../entries/connection";
import {
  DAppMessage,
  OpenMaskApiEvent,
  OpenMaskApiResponse,
} from "../entries/message";
import { backgroundEventsEmitter } from "../event";
import { ErrorCode, RuntimeError } from "../exception";
import { Logger } from "../logger";
import { getConnections, getNetwork } from "../store/browserStore";
import memoryStore from "../store/memoryStore";
import { showAsset } from "./dApp/assetService";
import {
  connectDApp,
  getBalance,
  getConnectedWallets,
} from "./dApp/connectService";
import { switchChain } from "./dApp/networkService";
import {
  tonConnectDisconnect,
  tonConnectRequest,
  tonConnectTransaction,
  tonReConnectRequest,
} from "./dApp/tonConnectService";
import {
  confirmAccountSeqNo,
  decryptMessage,
  deploySmartContract,
  encryptMessage,
  sendTransaction,
  signPersonalValue,
  signRawValue,
} from "./dApp/transactionService";

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

const validateWalletAddress = (
  address: string | undefined
): string | undefined => {
  if (!address) {
    return undefined;
  }

  try {
    Address.parse(address);
    return address;
  } catch (e) {
    throw new RuntimeError(ErrorCode.unexpectedParams, "Invalid address");
  }
};

const DataParamsSchema = Joi.object<{ data: string }>({
  data: Joi.string().required(),
});
const StringSchema = Joi.string().required();
const NumberSchema = Joi.number().required();

const validateAssetParams = async (value: any): Promise<AssetParams> => {
  try {
    if (value.type === "jetton") {
      return await JettonParamsSchema.validateAsync(value);
    } else {
      return await NftParamsSchema.validateAsync(value);
    }
  } catch (e) {
    throw new RuntimeError(ErrorCode.unexpectedParams, (e as Error).message);
  }
};

const handleDAppMessage = async (message: DAppMessage): Promise<unknown> => {
  const origin = decodeURIComponent(message.origin);

  switch (message.method) {
    case "ping": {
      return "pong";
    }

    case "wallet_requestAccounts":
    case "ton_requestAccounts": {
      return connectDApp(message.id, origin, message.event, message.params[0]);
    }
    case "ton_getAccounts": {
      return getConnectedWallets(origin, await getNetwork(), message.params[0]);
    }

    case "ton_requestWallets": {
      return connectDApp(message.id, origin, message.event, {
        publicKey: true,
      });
    }

    case "ton_getBalance": {
      return getBalance(origin, validateWalletAddress(message.params[0]));
    }

    case "ton_sendTransaction": {
      return sendTransaction(
        message.id,
        origin,
        message.params[0],
        validateWalletAddress(message.params[1])
      );
    }
    case "ton_confirmWalletSeqNo": {
      return confirmAccountSeqNo(
        origin,
        message.params[0],
        validateWalletAddress(message.params[1])
      );
    }
    case "ton_rawSign": {
      return signRawValue(
        message.id,
        origin,
        message.params[0],
        validateWalletAddress(message.params[1])
      );
    }
    case "ton_personalSign": {
      return signPersonalValue(
        message.id,
        origin,
        message.params[0],
        validateWalletAddress(message.params[1])
      );
    }

    case "ton_deployContract": {
      return deploySmartContract(
        message.id,
        origin,
        message.params[0],
        validateWalletAddress(message.params[1])
      );
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
      return showAsset(
        message.id,
        origin,
        message.event,
        await validateAssetParams(message.params[0]),
        validateWalletAddress(message.params[1])
      );
    }

    case "tonConnect_connect": {
      return tonConnectRequest(message.id, origin, message.params[0]);
    }
    case "tonConnect_reconnect": {
      return tonReConnectRequest(origin);
    }
    case "tonConnect_disconnect": {
      return tonConnectDisconnect(message.id, origin);
    }
    case "tonConnect_sendTransaction": {
      return tonConnectTransaction(
        message.id,
        origin,
        message.params[0],
        message.params[1]
      );
    }
    case "ton_decryptMessage": {
      return decryptMessage(
        message.id,
        origin,
        message.params[0],
        validateWalletAddress(message.params[1])
      );
    }
    case "ton_encryptMessage": {
      return encryptMessage(
        message.id,
        origin,
        message.params[0],
        validateWalletAddress(message.params[1])
      );
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
