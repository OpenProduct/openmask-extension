import { EventEmitter } from "./libs/eventEmitter";

class TonProvider extends EventEmitter {
  isTonMask = true;
  targetOrigin = "*";
  nextJsonRpcId = 0;
  promises: Record<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: any) => void;
    }
  > = {};

  constructor(ton = window.ton) {
    super();
    if (ton) {
      this.nextJsonRpcId = ton.nextJsonRpcId;
      this.promises = ton.promises;
      this.callbacks = ton.callbacks;
    }

    this.connect().catch((e) => console.error(e));

    if (ton) {
      ton.destroy();
    }

    window.addEventListener("message", this.onMessage);
  }

  send(method: string, params: any[] = []) {
    if (!method || typeof method !== "string") {
      return new Error("Method is not a valid string.");
    }

    if (!(params instanceof Array)) {
      return new Error("Params is not a valid array.");
    }

    const id = this.nextJsonRpcId++;
    const payload = {
      jsonrpc: "2.0",
      id,
      method,
      params,
      origin: window.origin,
    };

    const promise = new Promise((resolve, reject) => {
      this.promises[payload.id] = {
        resolve,
        reject,
      };
    });

    // Send jsonrpc request to TonMask
    window.postMessage(
      {
        type: "TonMaskProvider",
        message: payload,
      },
      this.targetOrigin
    );

    return promise;
  }

  onMessage = async (event: any) => {
    // Return if no data to parse
    if (!event || !event.data) {
      return;
    }
    const data = event.data;

    if (data.type !== "TonMaskAPI") return;

    console.log(event.data);

    // Return if not a jsonrpc response
    if (!data || !data.message || !data.message.jsonrpc) {
      return;
    }

    const message = data.message;
    const { id, method, error, result } = message;

    if (typeof id !== "undefined") {
      const promise = this.promises[id];
      if (promise) {
        // Handle pending promise
        if (data.type === "error") {
          promise.reject(message);
        } else if (message.error) {
          promise.reject(error);
        } else {
          promise.resolve(result);
        }
        delete this.promises[id];
      }
    } else {
      if (method) {
        if (method.indexOf("_subscription") > -1) {
          // Emit subscription notification
          this.emit("notification", message.params);
        } else if (method === "ton_accounts") {
          // todo
          this.emit("accountsChanged", message.params);
        }
      }
    }
  };

  addListener = this.on;
  removeListener = this.off;

  connect = async () => {
    return this.send("ping", []);
  };

  destroy() {
    window.removeEventListener("message", this.onMessage);
  }
}

const havePrevInstance = !!window.ton;

window.tonProtocolVersion = 1;
window.ton = new TonProvider();

if (!havePrevInstance) {
  window.dispatchEvent(new Event("tonready"));
}
