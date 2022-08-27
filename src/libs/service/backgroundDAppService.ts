import TonWeb from "tonweb";
import browser from "webextension-polyfill";
import { DAppMessage } from "../entries/message";
import { getNetworkConfig } from "../entries/network";
import { backgroundEventsEmitter } from "../event";
import { getConnections, getNetwork } from "../store/browserStore";
import memoryStore from "../store/memoryStore";
import {
  closeCurrentPopUp,
  openConnectDAppPopUp,
  openConnectUnlockPopUp,
} from "./notificationService";

const getWalletsByOrigin = async (origin: string) => {
  const whitelist = await getConnections();
  const account = whitelist[origin];
  if (account == null) {
    throw new Error(`Origin "${origin}" is not in whitelist`);
  }

  return account.wallets;
};

const getBalance = async (origin: string, wallet: [string | undefined]) => {
  const config = getNetworkConfig(await getNetwork());

  const provider = new TonWeb.HttpProvider(config.rpcUrl, {
    apiKey: config.apiKey,
  });

  if (wallet[0]) {
    const result = await provider.getBalance(wallet[0]);
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
    throw new Error("Application locked");
  }

  return await getWalletsByOrigin(origin);
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
    const [tab] = await browser.tabs.query({ active: true });
    const popupId = await openConnectDAppPopUp(id, origin, tab.favIconUrl);
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
      return message.event
        ? connectDApp(message.id, origin)
        : getConnectedWallets(origin);
    }
    case "ton_getBalance": {
      return getBalance(origin, message.params);
    }
    case "ton_getNetwork": {
      return getNetwork();
    }

    case "ton_getAccounts": {
      return getConnectedWallets(origin);
    }
    default:
      throw new Error(`Method "${message.method}" not implemented`);
  }
};
