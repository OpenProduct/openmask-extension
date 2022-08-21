import browser from "webextension-polyfill";
import { AppEventEmitter, RESPONSE } from "./libs/event";
import { EventEmitter } from "./libs/eventEmitter";
import { memoryStore } from "./libs/memory";

let popupPort: browser.Runtime.Port;
let contentScriptPorts = new Set<browser.Runtime.Port>();

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
  if (port.name === "gramWalletContentScript") {
    contentScriptPorts.add(port);
    port.onMessage.addListener(async (msg, port) => {
      console.log(msg);

      if (msg.type === "gramWalletAPI_ton_provider_connect") {
      }

      if (!msg.message) return;

      // const result = await controller.onDappMessage(
      //   msg.message.method,
      //   msg.message.params
      // );
      if (port) {
        port.postMessage(
          JSON.stringify({
            type: "gramWalletAPI",
            message: {
              jsonrpc: "2.0",
              id: msg.message.id,
              method: msg.message.method,
              result: undefined,
            },
          })
        );
      }
    });
    port.onDisconnect.addListener((port) => {
      contentScriptPorts.delete(port);
    });
  }
});
