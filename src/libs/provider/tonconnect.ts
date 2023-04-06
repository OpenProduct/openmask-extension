import { DeviceInfo } from "@tonconnect/protocol";
import { OpenMaskError } from "../entries/message";
import {
  TonConnectItemReply,
  TonConnectRequest,
} from "../entries/notificationMessage";
import { TonConnectError } from "../exception";
import { TonProvider } from "../provider";
import packageJson from "/package.json";

function getPlatform(): DeviceInfo["platform"] {
  const platform =
    (window.navigator as any)?.userAgentData?.platform ||
    window.navigator.platform;

  const userAgent = window.navigator.userAgent;

  const macosPlatforms = ["macOS", "Macintosh", "MacIntel", "MacPPC", "Mac68K"];
  const windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"];
  const iphonePlatforms = ["iPhone"];
  const iosPlatforms = ["iPad", "iPod"];

  let os: DeviceInfo["platform"] | null = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "mac";
  } else if (iphonePlatforms.indexOf(platform) !== -1) {
    os = "iphone";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "ipad";
  } else if (windowsPlatforms.indexOf(platform) !== -1) {
    os = "windows";
  } else if (/Android/.test(userAgent)) {
    os = "linux";
  } else if (/Linux/.test(platform)) {
    os = "linux";
  }

  return os!;
}

export const getDeviceInfo = (): DeviceInfo => {
  return {
    platform: getPlatform()!,
    appName: "OpenMask",
    appVersion: packageJson.version,
    maxProtocolVersion: 2,
    features: [
      "SendTransaction",
      {
        name: "SendTransaction",
        maxMessages: 4,
      },
    ],
  };
};

type ConnectEvent = ConnectEventSuccess | ConnectEventError;

interface DisconnectEvent {
  type: "disconnect";
  payload: {};
}

type ConnectEventSuccess = {
  event: "connect";
  payload: {
    items: TonConnectItemReply[];
    device: DeviceInfo;
  };
};

type ConnectEventError = {
  event: "connect_error";
  payload: {
    code: number;
    message: string;
  };
};

const formatConnectEventError = (error: TonConnectError): ConnectEventError => {
  return {
    event: "connect_error",
    payload: {
      code: error.code ?? 0,
      message: error.message,
    },
  };
};

export type TonConnectAppRequest = TonConnectSendTransactionRequest;

export type TonConnectAccount = {
  address: string; // '<wc>:<hex>'
  network: string; // '-239' for the mainnet and '-3' for the testnet
};

export interface TonConnectSendTransactionRequest {
  method: "sendTransaction";
  params: [string, string]; // json string TonConnectTransactionPayload, json string TonConnectAccount
  return: "back" | "none" | string;
  id: number;
}

export type TonConnectWalletResponse =
  | WalletResponseSuccess
  | WalletResponseError;

interface WalletResponseSuccess {
  result: string;
  id: string;
}

interface WalletResponseError {
  error: { code: number; message: string; data?: unknown };
  id: string;
}

type WalletEventName = "connect" | "connect_error" | "disconnect";

interface WalletEvent {
  event: WalletEventName;
  payload?: unknown; // "<event-payload>"; // specific payload for each event
}

export interface WalletInfo {
  name: string;
  image: string;
  tondns?: string;
  about_url: string;
}

export interface TonConnectBridge {
  deviceInfo: DeviceInfo; // see Requests/Responses spec
  walletInfo?: WalletInfo;
  protocolVersion: number; // max supported Ton Connect version (e.g. 2)
  isWalletBrowser: boolean; // if the page is opened into wallet's browser
  connect(
    protocolVersion: number,
    message: TonConnectRequest
  ): Promise<ConnectEvent>;
  restoreConnection(): Promise<ConnectEvent>;
  send(message: TonConnectAppRequest): Promise<TonConnectWalletResponse>;
  listen(callback: (event: WalletEvent) => void): () => void;
}

type TonConnectCallback = (event: WalletEvent) => void;

const mapErrorCode = (code?: number) => {
  switch (code) {
    case 1001:
      return 100;
    case 1002:
      return 300;
    default:
      return 0;
  }
};
export class TonConnect implements TonConnectBridge {
  callbacks: TonConnectCallback[] = [];

  deviceInfo: DeviceInfo = getDeviceInfo();
  walletInfo: WalletInfo = {
    name: "OpenMask",
    image:
      "https://raw.githubusercontent.com/OpenProduct/openmask-extension/main/public/openmask-logo-288.png",
    about_url: "https://www.openmask.app/",
  };
  protocolVersion = 2;
  isWalletBrowser = false;

  constructor(private provider: TonProvider, tonconnect?: TonConnect) {
    if (tonconnect) {
      this.callbacks = tonconnect.callbacks;
    } else {
      provider.on("chainChanged", () => {
        this.notify({
          event: "disconnect",
          payload: {},
        });
      });
    }
  }

  connect = async (
    protocolVersion: number,
    message: TonConnectRequest
  ): Promise<ConnectEvent> => {
    if (protocolVersion > this.protocolVersion) {
      return this.notify(
        formatConnectEventError(
          new TonConnectError("Unsupported protocol version", 1)
        )
      );
    }
    try {
      const items = await this.provider.send<TonConnectItemReply[]>(
        "tonConnect_connect",
        message
      );

      return this.notify({
        event: "connect",
        payload: {
          items: items,
          device: getDeviceInfo(),
        },
      });
    } catch (e) {
      if (e instanceof TonConnectError) {
        return this.notify(formatConnectEventError(e));
      } else {
        return this.notify(
          formatConnectEventError(
            new TonConnectError(
              (e as OpenMaskError).message ?? "Unknown error",
              mapErrorCode((e as OpenMaskError).code)
            )
          )
        );
      }
    }
  };

  disconnect = async () => {
    await this.provider.send(`tonConnect_disconnect`);
    return this.notify<WalletEvent>({
      event: "disconnect",
      payload: {},
    });
  };

  restoreConnection = async (): Promise<ConnectEvent> => {
    try {
      const items = await this.provider.send<TonConnectItemReply[]>(
        "tonConnect_reconnect",
        [{ name: "ton_addr" }]
      );

      return this.notify({
        event: "connect",
        payload: {
          items: items,
          device: getDeviceInfo(),
        },
      });
    } catch (e) {
      if (e instanceof TonConnectError) {
        return this.notify(formatConnectEventError(e));
      } else {
        return this.notify(
          formatConnectEventError(
            new TonConnectError((e as Error).message ?? "Unknown error")
          )
        );
      }
    }
  };

  send = async (
    message: TonConnectAppRequest
  ): Promise<TonConnectWalletResponse> => {
    try {
      const result = await this.provider.send<string>(
        `tonConnect_${message.method}`,
        message.params.map((item) => JSON.parse(item))
      );
      return {
        result,
        id: String(message.id),
      };
    } catch (e) {
      return {
        error: e as WalletResponseError["error"],
        id: String(message.id),
      };
    }
  };

  listen = (callback: (event: WalletEvent) => void): (() => void) => {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((item) => item != callback);
    };
  };

  notify = <E extends ConnectEvent | WalletEvent>(event: E): E => {
    this.callbacks.forEach((item) => item(event));
    return event;
  };
}
