import browser from "webextension-polyfill";
import { OpenMaskApiEvent, OpenMaskApiResponse } from "./libs/entries/message";
import { backgroundEventsEmitter, popUpEventEmitter } from "./libs/event";
import { RuntimeError } from "./libs/exception";
import { handleDAppMessage } from "./libs/service/backgroundDAppService";
import { setPopUpPort } from "./libs/service/backgroundPopUpService";

let contentScriptPorts = new Set<browser.Runtime.Port>();

const providerResponse = (
  id: number,
  method: string,
  result: undefined | unknown,
  error?: RuntimeError
): OpenMaskApiResponse => {
  return {
    type: "TonMaskAPI",
    message: {
      jsonrpc: "2.0",
      id,
      method,
      result,
      error: error
        ? {
            message: error.message,
            code: error.code,
            description: error.description,
          }
        : undefined,
    },
  };
};

const providerEvent = (
  method: "accountsChanged" | "chainChanged",
  result: undefined | unknown
): OpenMaskApiEvent => {
  return {
    type: "TonMaskAPI",
    message: {
      jsonrpc: "2.0",
      method,
      result,
    },
  };
};

browser.runtime.onConnect.addListener((port) => {
  if (port.name === "TonMaskUI") {
    setPopUpPort(port);

    port.onMessage.addListener((message) => {
      console.log(message);
      popUpEventEmitter.emit<any>(message.method, message);
    });

    port.onDisconnect.addListener(() => {
      setPopUpPort(null!);
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
        .catch((e: RuntimeError) => [undefined, e] as const);

      console.log({ msg, result, error });
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

backgroundEventsEmitter.on("chainChanged", (message) => {
  contentScriptPorts.forEach((port) => {
    port.postMessage(providerEvent("chainChanged", message.params));
  });
});

backgroundEventsEmitter.on("accountsChanged", (message) => {
  contentScriptPorts.forEach((port) => {
    console.log(port.sender);
    port.postMessage(providerEvent("accountsChanged", message.params));
  });
});
