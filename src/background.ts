import browser from "webextension-polyfill";
import { AppEventEmitter, RESPONSE } from "./libs/event";
import { EventEmitter } from "./libs/eventEmitter";
import { memoryStore } from "./libs/memory";

let popupPort: browser.Runtime.Port;

export const sendResponse = <Payload>(id?: number, params?: Payload) => {
  popupPort.postMessage({
    method: RESPONSE,
    id,
    params,
  });
};

const backgroundEventEmitter: AppEventEmitter = new EventEmitter();
const inMemoryStore = memoryStore();

backgroundEventEmitter.on("isLock", (message) => {
  sendResponse(message.id, inMemoryStore.isLock());
});

backgroundEventEmitter.on("getPassword", (message) => {
  sendResponse(message.id, inMemoryStore.getPassword());
});

backgroundEventEmitter.on("setPassword", (message) => {
  sendResponse(message.id, inMemoryStore.setPassword(message.params));
  popupPort.postMessage({ method: "unlock" });
});

backgroundEventEmitter.on("tryToUnlock", (message) => {
  inMemoryStore.setPassword(message.params);
  popupPort.postMessage({ method: "unlock" });
});

backgroundEventEmitter.on("lock", () => {
  inMemoryStore.setPassword(null);
  popupPort.postMessage({ method: "locked" });
});

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "TonMaskUI") {
    popupPort = port;

    popupPort.onMessage.addListener((message) => {
      console.log(message);
      backgroundEventEmitter.emit<any>(message.method, message);
    });

    popupPort.onDisconnect.addListener(() => {
      popupPort = null!;
    });
  }
});
