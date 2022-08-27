import browser from "webextension-polyfill";
import { popUpEventEmitter } from "./libs/event";
import { handleDAppMessage } from "./libs/service/backgroundDAppService";
import { setPopUpPort } from "./libs/service/backgroundPopUpService";

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
        .catch((e: Error) => [undefined, e.message] as const);

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
