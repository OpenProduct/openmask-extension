import { getConnections } from "./browserStore";
import { DAppMessage } from "./entries/message";
import { backgroundEventsEmitter } from "./event";
import memoryStore from "./memoryStore";
import {
  closeCurrentPopUp,
  openConnectDAppPopUp,
  openConnectUnlockPopUp,
} from "./notificationService";

const getConnectedWallets = async (origin: string) => {
  if (memoryStore.isLock()) {
    throw new Error("Application locked");
  }

  const whitelist = await getConnections();
  const account = whitelist[origin];
  if (account == null) {
    throw new Error(`Origin "${origin}" is not in whitelist`);
  }

  return account.wallets;
};

const waitUnlock = () => {
  return new Promise((resolve) => {
    const unlock = () => {
      backgroundEventsEmitter.off("unlock", unlock);
      resolve(undefined);
    };
    backgroundEventsEmitter.on("unlock", unlock);
  });
};

const waitApprove = (id: number) => {
  return new Promise((resolve, reject) => {
    const approve = (options: { params: number }) => {
      if (options.params === id) {
        backgroundEventsEmitter.off("approveRequest", approve);
        backgroundEventsEmitter.on("rejectRequest", cancel);
        resolve(undefined);
      }
    };
    const cancel = (options: { params: number }) => {
      if (options.params === id) {
        backgroundEventsEmitter.off("approveRequest", approve);
        backgroundEventsEmitter.on("rejectRequest", cancel);
        reject("Reject request");
      }
    };
    backgroundEventsEmitter.on("approveRequest", approve);
    backgroundEventsEmitter.on("rejectRequest", cancel);
  });
};

const connectDApp = async (id: number, origin: string) => {
  const whitelist = await getConnections();
  if (whitelist[origin] != null) {
    if (memoryStore.isLock()) {
      const popupId = await openConnectUnlockPopUp();
      await waitUnlock();
      await closeCurrentPopUp(popupId);
    }
  } else {
    const popupId = await openConnectDAppPopUp(id, origin);
    try {
      await waitApprove(id);
    } finally {
      await closeCurrentPopUp(popupId);
    }
  }
  return await getConnectedWallets(origin);
};

export const handleDAppMessage = async (message: DAppMessage) => {
  const origin = decodeURIComponent(message.origin);

  switch (message.method) {
    case "ping": {
      return "pong";
    }
    case "ton_requestAccounts": {
      return connectDApp(message.id, origin);
    }
    case "ton_askAccounts": {
      return getConnectedWallets(origin);
    }
    default:
      throw new Error(`Method "${message.method}" not implemented`);
  }
};
