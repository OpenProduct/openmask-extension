import browser from "webextension-polyfill";
import { handleDAppMessage } from "./libs/backgroundService";
import {
  backgroundEventsEmitter,
  popUpEventEmitter,
  RESPONSE,
} from "./libs/event";
import memoryStore from "./libs/memoryStore";

let popupPort: browser.Runtime.Port;
let contentScriptPorts = new Set<browser.Runtime.Port>();

const providerResponse = (
  id: number,
  method: string,
  result: undefined | unknown,
  error?: string
) => {
  return {
    type: "TonMaskAPI",
    message: {
      jsonrpc: "2.0",
      id,
      method,
      result,
      error,
    },
  };
};

export const sendUIResponse = <Payload>(id?: number, params?: Payload) => {
  popupPort.postMessage({
    method: RESPONSE,
    id,
    params,
  });
};

popUpEventEmitter.on("isLock", (message) => {
  sendUIResponse(message.id, memoryStore.isLock());
});

popUpEventEmitter.on("getPassword", (message) => {
  sendUIResponse(message.id, memoryStore.getPassword());
});

popUpEventEmitter.on("setPassword", (message) => {
  sendUIResponse(message.id, memoryStore.setPassword(message.params));
  popupPort.postMessage({ method: "unlock" });
});

popUpEventEmitter.on("tryToUnlock", (message) => {
  memoryStore.setPassword(message.params);
  backgroundEventsEmitter.emit("unlock");
  popupPort.postMessage({ method: "unlock" });
});

popUpEventEmitter.on("lock", () => {
  memoryStore.setPassword(null);
  backgroundEventsEmitter.emit("locked");
  popupPort.postMessage({ method: "locked" });
});

popUpEventEmitter.on("approveRequest", (message) => {
  backgroundEventsEmitter.emit("approveRequest", message);
});

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "TonMaskUI") {
    popupPort = port;

    popupPort.onMessage.addListener((message) => {
      console.log(message);
      popUpEventEmitter.emit<any>(message.method, message);
    });

    popupPort.onDisconnect.addListener(() => {
      popupPort = null!;
    });
  }

  if (port.name === "TonMaskContentScript") {
    contentScriptPorts.add(port);
    port.onMessage.addListener(async (msg, contentPort) => {
      if (msg.type !== "TonMaskProvider" || !msg.message) {
        return;
      }

      const [result, error] = await handleDAppMessage(msg.message)
        .then((result) => [result, undefined] as const)
        .catch((e: Error) => [undefined, e.message] as const);

      console.log({ msg, result });
      if (contentPort) {
        contentPort.postMessage(
          providerResponse(msg.message.id, msg.message.method, result, error)
        );
      }
    });
    port.onDisconnect.addListener((port) => {
      contentScriptPorts.delete(port);
    });
  }
});
