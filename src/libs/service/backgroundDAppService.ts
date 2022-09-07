import HttpProvider from "@tonmask/web-sdk/build/providers/httpProvider";
import browser from "webextension-polyfill";
import { Connections } from "../entries/connection";
import { DAppMessage } from "../entries/message";
import { getNetworkConfig, networkConfigs } from "../entries/network";
import { Permission } from "../entries/permission";
import { TransactionParams } from "../entries/transaction";
import { ApproveTransaction, backgroundEventsEmitter } from "../event";
import { ClosePopUpError, ErrorCode, RuntimeError } from "../exception";
import { Logger } from "../logger";
import {
  getAccountState,
  getConnections,
  getNetwork,
  QueryType,
  setAccountState,
  setStoreValue,
} from "../store/browserStore";
import memoryStore from "../store/memoryStore";
import {
  closeCurrentPopUp,
  openConnectDAppPopUp,
  openConnectUnlockPopUp,
  openSendTransactionPopUp,
  openSwitchChainPopUp,
} from "./notificationService";
import { confirmWalletSeqNo } from "./walletService";

/**
 * Service methods and subscription to handle DApp events
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

const getWalletsByOrigin = async (origin: string, network: string) => {
  const whitelist = await getConnections(network);
  const account = whitelist[origin];
  if (account == null) {
    throw new RuntimeError(
      ErrorCode.unauthorizeOperation,
      `Origin "${origin}" is not in whitelist`
    );
  }

  const wallets = Object.keys(account.connect);
  if (wallets.length === 0) {
    throw new RuntimeError(
      ErrorCode.unauthorizeOperation,
      `Origin "${origin}" don't have access to wallets for "${network}"`
    );
  }
  return wallets;
};

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
      throw new RuntimeError(
        ErrorCode.unauthorizeOperation,
        `Application locked`
      );
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
    const [tab] = await browser.tabs.query({ active: true });
    const popupId = await openConnectDAppPopUp(id, origin, tab?.favIconUrl);
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

const switchActiveAddress = async (origin: string, from?: string) => {
  const network = await getNetwork();
  const wallets = await getWalletsByOrigin(origin, network);
  const account = await getAccountState(network);

  if (!from) {
    // Switch to wallet with use permissions
    if (account.activeWallet !== wallets[0]) {
      await setAccountState({ ...account, activeWallet: wallets[0] }, network);
    }
    return;
  }

  const address = wallets.find((item) => item === from);
  if (!address) {
    throw new RuntimeError(
      ErrorCode.unauthorizeOperation,
      `Don't have an access to wallet "${from}"`
    );
  }

  if (account.activeWallet !== address) {
    await setAccountState({ ...account, activeWallet: address }, network);
  }
};

const waitTransaction = (id: number, popupId?: number) => {
  return new Promise<number>((resolve, reject) => {
    const approve = (options: { params: ApproveTransaction }) => {
      if (options.params.id === id) {
        backgroundEventsEmitter.off("approveTransaction", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        resolve(options.params.seqNo);
      }
    };
    const close = (options: { params: number }) => {
      if (popupId === options.params) {
        backgroundEventsEmitter.off("approveTransaction", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        reject(new ClosePopUpError());
      }
    };
    const cancel = (options: { params: number }) => {
      if (options.params === id) {
        backgroundEventsEmitter.off("approveTransaction", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        reject(
          new RuntimeError(ErrorCode.rejectOperation, "Reject transaction")
        );
      }
    };
    backgroundEventsEmitter.on("approveTransaction", approve);
    backgroundEventsEmitter.on("rejectRequest", cancel);
    backgroundEventsEmitter.on("closedPopUp", close);
  });
};

const sendTransaction = async (
  id: number,
  origin: string,
  params: TransactionParams
) => {
  const current = memoryStore.getOperation();
  if (current && current.kind === "send") {
    throw new RuntimeError(
      ErrorCode.unauthorizeOperation,
      "Another operation in progress"
    );
  }

  await switchActiveAddress(origin, params.from);

  const popupId = await openSendTransactionPopUp(id, origin, params);
  try {
    const seqNo = await waitTransaction(id, popupId);
    memoryStore.setOperation(null);
    return seqNo;
  } finally {
    await closeCurrentPopUp(popupId);
  }
};

export const waitApprove = (id: number, popupId?: number) => {
  return new Promise((resolve, reject) => {
    const approve = (options: { params: number }) => {
      if (options.params === id) {
        backgroundEventsEmitter.off("approveRequest", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        resolve(undefined);
      }
    };
    const close = (options: { params: number }) => {
      if (popupId === options.params) {
        backgroundEventsEmitter.off("approveRequest", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        reject(new ClosePopUpError());
      }
    };
    const cancel = (options: { params: number }) => {
      if (options.params === id) {
        backgroundEventsEmitter.off("approveRequest", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        reject(new RuntimeError(ErrorCode.rejectOperation, "Reject request"));
      }
    };
    backgroundEventsEmitter.on("approveRequest", approve);
    backgroundEventsEmitter.on("rejectRequest", cancel);
    backgroundEventsEmitter.on("closedPopUp", close);
  });
};

const getDAppPermissions = async (
  network: string,
  origin: string
): Promise<Permission[]> => {
  const connections = await getConnections(network);
  if (!connections[origin]) return [];

  const [first] = await getWalletsByOrigin(origin, network);

  return connections[origin].connect[first] ?? [];
};

export const switchChain = async (
  id: number,
  origin: string,
  isEvent: boolean,
  network: string
) => {
  const current = await getNetwork();
  if (current === network) {
    throw new RuntimeError(
      ErrorCode.unexpectedParams,
      `Wallet already use "${network}" network`
    );
  }
  if (networkConfigs.find((item) => item.name === network) == null) {
    throw new RuntimeError(
      ErrorCode.unexpectedParams,
      `Wallet don't have configuration for "${network}" network`
    );
  }

  const permissions = await getDAppPermissions(current, origin);

  // DApp have permission to change network
  if (permissions.includes(Permission.switchNetwork)) {
    await setStoreValue(QueryType.network, network);
    backgroundEventsEmitter.emit("chainChanged", {
      method: "chainChanged",
      params: network,
    });
    return;
  }

  // Show PopUp to ask confirmation to change network
  if (!isEvent) {
    throw new RuntimeError(
      ErrorCode.unexpectedParams,
      `The method have to call with user event, for example when user click to button, calling event by script is restricted.`
    );
  }

  const [tab] = await browser.tabs.query({ active: true });

  const popupId = await openSwitchChainPopUp(
    id,
    origin,
    network,
    tab?.favIconUrl
  );
  try {
    await waitApprove(id, popupId);
  } finally {
    await closeCurrentPopUp(popupId);
  }
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
