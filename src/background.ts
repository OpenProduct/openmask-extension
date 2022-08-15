import browser from "webextension-polyfill";
import { EventMessage } from "./libs/event";
import { memoryStore } from "./libs/memory";

browser.runtime.onInstalled.addListener(function () {
  console.log("background");
});

let popupPort: browser.Runtime.Port;

const sendResponse = <Payload>(id?: number, params?: Payload) => {
  popupPort.postMessage({
    method: "Response",
    id,
    params,
  });
};

(() => {
  const inMemoryStore = memoryStore();

  const onViewMessage = (message: EventMessage) => {
    switch (message.method) {
      case "isLock":
        return sendResponse(message.id, inMemoryStore.isLock());
      case "getPassword":
        return sendResponse(message.id, inMemoryStore.getPassword());
      case "tryToUnlock": {
        inMemoryStore.setPassword(message.params);
        return popupPort.postMessage({ method: "unlock" });
      }
      case "lock": {
        inMemoryStore.setPassword(null);
        return popupPort.postMessage({ method: "locked" });
      }
    }
  };

  browser.runtime.onConnect.addListener((port) => {
    if (port.name === "TonMaskUI") {
      popupPort = port;

      popupPort.onMessage.addListener(function (message: EventMessage) {
        onViewMessage(message);
      });

      popupPort.onDisconnect.addListener(() => {
        popupPort = null!;
      });
    }
  });
})();
