import browser from "webextension-polyfill";
import { backgroundService } from "./libs/backgroundService";
import { AppEventEmitter, RESPONSE } from "./libs/event";
import { EventEmitter } from "./libs/eventEmitter";
import { memoryStore } from "./libs/memoryStore";

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

const backgroundEventEmitter: AppEventEmitter = new EventEmitter();
const memStore = memoryStore();

const service = backgroundService({ memStore });

backgroundEventEmitter.on("isLock", (message) => {
  sendUIResponse(message.id, memStore.isLock());
});

backgroundEventEmitter.on("getPassword", (message) => {
  sendUIResponse(message.id, memStore.getPassword());
});

backgroundEventEmitter.on("setPassword", (message) => {
  sendUIResponse(message.id, memStore.setPassword(message.params));
  popupPort.postMessage({ method: "unlock" });
});

backgroundEventEmitter.on("tryToUnlock", (message) => {
  memStore.setPassword(message.params);
  popupPort.postMessage({ method: "unlock" });
});

backgroundEventEmitter.on("lock", () => {
  memStore.setPassword(null);
  popupPort.postMessage({ method: "locked" });
});

const handleDAppMessage = async (method: string, params: any) => {
  switch (method) {
    case "connect": {
      return true;
    }
    case "ton_requestAccounts": {
      return service.getActiveWallet();
    }
    case "ton_askConnection": {
      return service.connectDApp();
    }
    default:
      throw new Error(`Method "${method}" not implemented`);
  }
};

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

  if (port.name === "TonMaskContentScript") {
    contentScriptPorts.add(port);
    port.onMessage.addListener(async (msg, contentPort) => {
      if (msg.type !== "TonMaskProvider" || !msg.message) {
        return;
      }

      const [result, error] = await handleDAppMessage(
        msg.message.method,
        msg.message.params
      )
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
