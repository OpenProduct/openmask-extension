import browser from "webextension-polyfill";

const PORT_NAME = "TonMaskContentScript";

injectScript();
setupStream();

/**
 * Injects a script tag into the current document
 */
function injectScript() {
  try {
    const container = document.head || document.documentElement;
    const scriptTag = document.createElement("script");
    scriptTag.setAttribute("async", "false");
    scriptTag.setAttribute("src", browser.runtime.getURL("provider.js"));

    container.insertBefore(scriptTag, container.children[0]);
    container.removeChild(scriptTag);
  } catch (error) {
    console.error("TonMask: Provider injection failed.", error);
  }
}

interface PageMessagePayload {
  type: string;
  message: {
    id: number;
    method: string;
    params: any;
  };
}

interface PageMessage {
  data?: PageMessagePayload;
}

function isValidMethod(type: string) {
  switch (type) {
    case "TonMask_ton_provider_write":
    case "TonMask_ton_provider_connect":
      return true;
    default:
      return false;
  }
}
/**
 * the transport-specific streams for communication between provider and background
 */
async function setupStream() {
  let port: browser.Runtime.Port;

  const onPortMessage = (data: unknown) => {
    window.postMessage(data, "*");
  };

  const connectBackground = () => {
    port = browser.runtime.connect({ name: PORT_NAME });
    port.onMessage.addListener(onPortMessage);
  };

  connectBackground();

  const onPageMessage = (e: PageMessage) => {
    if (!e.data) return;
    if (!isValidMethod(e.data.type)) return;

    sendMessageToActivePort(e.data);
  };

  const sendMessageToActivePort = (
    payload: PageMessagePayload,
    isRepeat = false
  ) => {
    try {
      port.postMessage(payload);
    } catch (err) {
      const isInvalidated = (err as Error).message
        .toString()
        .includes("Extension context invalidated");
      if (isInvalidated) {
        window.removeEventListener("message", onPageMessage);
        return;
      }

      const isDisconnected = (err as Error).message
        .toString()
        .includes("disconnected port");

      if (!isRepeat && isDisconnected) {
        connectBackground();
        sendMessageToActivePort(payload, true);
      } else {
        onPortMessage(
          JSON.stringify({
            type: "TonMaskAPI",
            message: {
              id: payload?.message?.id,
              method: payload?.message?.method,
              error: { message: (err as Error).message },
              jsonrpc: true,
            },
          })
        );
      }
    }
  };

  window.addEventListener("message", onPageMessage);
}
