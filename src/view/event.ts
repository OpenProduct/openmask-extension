import { EventEmitter } from "events";
import { useEffect, useState } from "react";
import browser from "webextension-polyfill";
import { EventMessage } from "../libs/event";

let port: browser.Runtime.Port;

export const uiStream = new EventEmitter();

export const useEvent = (name: string) => {
  const [event, setEvent] = useState<any>(undefined);

  useEffect(() => {
    uiStream.on(name, setEvent);
    return () => {
      uiStream.off(name, setEvent);
    };
  }, []);

  return event;
};

const RESPONSE = "Response";

export const messageBackground = (message: EventMessage) => {
  port.postMessage(message);
};

export const askBackground = <T, R>(
  method: EventMessage["method"],
  params?: T
): Promise<R> => {
  const id = Date.now();
  messageBackground({ method, id, params: params as any });
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      port.onMessage.removeListener(handler);
      reject("Timeout");
    }, 5000);

    const handler = (message: EventMessage) => {
      if (message.method === RESPONSE && message.id === id) {
        clearTimeout(timer);
        resolve(message.params as any as R);
      }
    };

    port.onMessage.addListener(handler);
  });
};

export const connectToBackground = () => {
  port = browser.runtime.connect({ name: "TonMaskUI" });

  port.onMessage.addListener((data) => {
    uiStream.emit(data.method, data.params);
  });

  port.onDisconnect.addListener(() => {
    connectToBackground();
  });
};
