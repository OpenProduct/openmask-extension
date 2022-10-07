/**
 * Service methods and subscription to handle PopUp events
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

import browser from "webextension-polyfill";
import {
  BackgroundEvents,
  backgroundEventsEmitter,
  popUpEventEmitter,
  RESPONSE,
} from "../event";
import { Logger } from "../logger";
import { getNetwork } from "../store/browserStore";
import memoryStore from "../store/memoryStore";
import { closeCurrentPopUp, getPopup } from "./dApp/notificationService";
import {
  confirmWalletSeqNo,
  getActiveWallet,
  getWalletsByOrigin,
} from "./walletService";

let popUpPort: browser.Runtime.Port;

export const handlePopUpConnection = (port: browser.Runtime.Port) => {
  popUpPort = port;

  port.onMessage.addListener((message) => {
    Logger.log(message);
    popUpEventEmitter.emit<any>(message.method, message);
  });

  port.onDisconnect.addListener(() => {
    popUpPort = null!;
  });
};

export const sendMessageToPopUp = <Payload>(
  method: keyof BackgroundEvents | typeof RESPONSE,
  id?: number,
  params?: Payload
) => {
  const message = {
    method,
    id,
    params,
  };
  Logger.log("background", message);
  popUpPort.postMessage(message);
};

export const sendResponseToPopUp = <Payload>(id?: number, params?: Payload) => {
  sendMessageToPopUp(RESPONSE, id, params);
};

popUpEventEmitter.on("isLock", (message) => {
  sendResponseToPopUp(message.id, memoryStore.isLock());
});

popUpEventEmitter.on("getPassword", (message) => {
  sendResponseToPopUp(message.id, memoryStore.getPassword());
});

popUpEventEmitter.on("getWallets", async (message) => {
  try {
    const wallets = await getWalletsByOrigin(
      message.params,
      await getNetwork()
    );
    sendResponseToPopUp(message.id, wallets);
  } catch (e) {
    Logger.error(e);
    sendResponseToPopUp(message.id, undefined);
  }
});

popUpEventEmitter.on("setPassword", (message) => {
  sendResponseToPopUp(message.id, memoryStore.setPassword(message.params));
  sendMessageToPopUp("unlock");
});

popUpEventEmitter.on("tryToUnlock", (message) => {
  memoryStore.setPassword(message.params);
  backgroundEventsEmitter.emit("unlock");
  sendMessageToPopUp("unlock");
});

popUpEventEmitter.on("lock", () => {
  memoryStore.setPassword(null);
  backgroundEventsEmitter.emit("locked");
  sendMessageToPopUp("locked");
});

popUpEventEmitter.on("storeOperation", (message) => {
  memoryStore.setOperation(message.params);
});

popUpEventEmitter.on("getOperation", (message) => {
  sendResponseToPopUp(message.id, memoryStore.getOperation());
});

popUpEventEmitter.on("confirmSeqNo", async (message) => {
  try {
    await confirmWalletSeqNo(message.params, await getActiveWallet());
    sendResponseToPopUp(message.id);
  } catch (e) {
    Logger.error(e);
    sendResponseToPopUp(message.id);
  }
});

popUpEventEmitter.on("getNotification", (message) => {
  sendResponseToPopUp(message.id, memoryStore.getNotification());
});

popUpEventEmitter.on("chainChanged", (message) => {
  memoryStore.setOperation(null);
  backgroundEventsEmitter.emit("chainChanged", message);
});

popUpEventEmitter.on("closePopUp", async (message) => {
  try {
    const popup = await getPopup();
    await closeCurrentPopUp((popup && popup.id) || undefined);
  } catch (e) {
    Logger.error(e);
  }
});

// Just Proxy messages to background service
popUpEventEmitter.on("approveRequest", (message) => {
  backgroundEventsEmitter.emit("approveRequest", message);
});

popUpEventEmitter.on("rejectRequest", (message) => {
  backgroundEventsEmitter.emit("rejectRequest", message);
});

popUpEventEmitter.on("accountsChanged", (message) => {
  backgroundEventsEmitter.emit("accountsChanged", message);
});

popUpEventEmitter.on("proxyChanged", (message) => {
  backgroundEventsEmitter.emit("proxyChanged", message);
});

// End of proxy messages
