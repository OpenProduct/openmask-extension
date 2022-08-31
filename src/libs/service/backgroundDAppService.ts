import HttpProvider from "@tonmask/web-sdk/build/providers/httpProvider";
import browser from "webextension-polyfill";
import { DAppMessage } from "../entries/message";
import { getNetworkConfig } from "../entries/network";
import { TransactionParams } from "../entries/transaction";
import { ApproveTransaction, backgroundEventsEmitter } from "../event";
import { ClosePopUpError, ErrorCode, RuntimeError } from "../exception";
import {
  getAccountState,
  getConnections,
  getNetwork,
  setAccountState,
} from "../store/browserStore";
import memoryStore from "../store/memoryStore";
import {
  closeCurrentPopUp,
  openConnectDAppPopUp,
  openConnectUnlockPopUp,
  openSendTransactionPopUp,
} from "./notificationService";
import { confirmWalletSeqNo } from "./walletService";

const getWalletsByOrigin = async (origin: string) => {
  const whitelist = await getConnections();
  const account = whitelist[origin];
  if (account == null) {
    throw new RuntimeError(
      ErrorCode.unauthorizeOperation,
      `Origin "${origin}" is not in whitelist`
    );
  }

  return account.wallets;
};

const getBalance = async (origin: string, wallet: string | undefined) => {
  const config = getNetworkConfig(await getNetwork());

  const provider = new HttpProvider(config.rpcUrl, {
    apiKey: config.apiKey,
  });

  if (wallet) {
    const result = await provider.getBalance(wallet);
    console.log({ result });
    return result;
  }

  const [first] = await getWalletsByOrigin(origin);
  const result = await provider.getBalance(first);
  console.log({ result });
  return result;
};

const getConnectedWallets = async (origin: string) => {
  if (memoryStore.isLock()) {
    throw new RuntimeError(
      ErrorCode.unauthorizeOperation,
      `Application locked`
    );
  }

  return await getWalletsByOrigin(origin);
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

const waitApprove = (id: number, popupId?: number) => {
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

const connectDApp = async (id: number, origin: string, isEvent: boolean) => {
  if (!isEvent) {
    return await getConnectedWallets(origin);
  }
  const whitelist = await getConnections();
  if (whitelist[origin] != null) {
    if (memoryStore.isLock()) {
      const popupId = await openConnectUnlockPopUp();
      await waitUnlock(popupId);
      await closeCurrentPopUp(popupId);
    }
  } else {
    const [tab] = await browser.tabs.query({ active: true });
    const popupId = await openConnectDAppPopUp(id, origin, tab.favIconUrl);
    try {
      await waitApprove(id, popupId);
    } finally {
      await closeCurrentPopUp(popupId);
    }
  }
  return await getConnectedWallets(origin);
};

const switchActiveAddress = async (origin: string, from?: string) => {
  const wallets = await getWalletsByOrigin(origin);
  const network = await getNetwork();
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

export const handleDAppMessage = async (message: DAppMessage) => {
  const origin = decodeURIComponent(message.origin);

  switch (message.method) {
    case "ping": {
      return "pong";
    }
    case "ton_getLocked": {
      return memoryStore.isLock();
    }
    case "ton_getChain": {
      return getNetwork();
    }
    case "ton_getBalance": {
      return getBalance(origin, message.params[0]);
    }
    case "ton_requestAccounts": {
      return connectDApp(message.id, origin, message.event);
    }
    case "ton_sendTransaction": {
      return sendTransaction(message.id, origin, message.params[0]);
    }
    case "ton_confirmWalletSeqNo": {
      return confirmWalletSeqNo(message.params[0]);
    }

    case "ton_getNetwork": {
      return getNetwork();
    }
    case "ton_getAccounts": {
      return getConnectedWallets(origin);
    }
    default:
      throw new RuntimeError(
        ErrorCode.unexpectedParams,
        `Method "${message.method}" not implemented`
      );
  }
};
