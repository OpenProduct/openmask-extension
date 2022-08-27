import browser from "webextension-polyfill";
import { getNetworkConfig } from "../entries/network";
import {
  BackgroundEvents,
  backgroundEventsEmitter,
  popUpEventEmitter,
  RESPONSE,
} from "../event";
import { HttpProvider } from "../provider/backgroundTonProvider";
import { getAccountState, getNetwork } from "../store/browserStore";
import memoryStore from "../store/memoryStore";

let popUpPort: browser.Runtime.Port;

export const setPopUpPort = (port: browser.Runtime.Port) => {
  popUpPort = port;
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
  console.log("background", message);
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

popUpEventEmitter.on("approveRequest", (message) => {
  backgroundEventsEmitter.emit("approveRequest", message);
});

popUpEventEmitter.on("rejectRequest", (message) => {
  backgroundEventsEmitter.emit("rejectRequest", message);
});

popUpEventEmitter.on("confirmSeqNo", async (message) => {
  try {
    const network = await getNetwork();
    const config = getNetworkConfig(network);

    const provider = new HttpProvider(config.rpcUrl, {
      apiKey: config.apiKey,
    });
    const { activeWallet } = await getAccountState(network);

    if (!activeWallet) {
      throw new Error("Unexpected active wallet");
    }
    let currentSeqNo = 0;
    do {
      await new Promise((resolve) => setTimeout(resolve, 4000));

      currentSeqNo = await provider.getSeqNo(activeWallet);
      console.log(currentSeqNo, message.params);
    } while (currentSeqNo <= message.params);

    sendResponseToPopUp(message.id);
  } catch (e) {
    console.error(e);
    sendResponseToPopUp(message.id);
  }
});
