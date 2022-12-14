import {
  TonConnectItemReply,
  TonConnectRequest,
} from "../entries/notificationMessage";
import { TonConnectError } from "../exception";
import { TonProvider } from "../provider";
import packageJson from "/package.json";

export type Feature = "SendTransaction";

export type DeviceInfo = {
  platform: "iphone" | "ipad" | "android" | "windows" | "mac" | "linux";
  appName: string; // e.g. "Tonkeeper"
  appVersion: string; // e.g. "2.3.367"
  maxProtocolVersion: number;
  features: Feature[]; // list of supported features and methods in RPC
  // Currently there is only one feature -- 'SendTransaction';
};

function getPlatform(): DeviceInfo["platform"] {
  var userAgent = window.navigator.userAgent,
    platform =
      (window.navigator as any)?.userAgentData?.platform ||
      window.navigator.platform,
    macosPlatforms = ["Macintosh", "MacIntel", "MacPPC", "Mac68K"],
    windowsPlatforms = ["Win32", "Win64", "Windows", "WinCE"],
    iosPlatforms = ["iPhone", "iPad", "iPod"],
    os: DeviceInfo["platform"] | null = null;

  if (macosPlatforms.indexOf(platform) !== -1) {
    os = "mac";
  } else if (iosPlatforms.indexOf(platform) !== -1) {
    os = "mac";
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
    features: ["SendTransaction"],
  };
};

type ConnectEvent = ConnectEventSuccess | ConnectEventError;

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

export interface TonConnectSendTransactionRequest {
  method: "sendTransaction";
  params: [string]; // json string TonConnectTransactionPayload
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

interface WalletEvent {
  event: WalletEventName;
  payload?: unknown; // "<event-payload>"; // specific payload for each event
}

type WalletEventName = "connect" | "connect_error" | "disconnect";

export interface TonConnectBridge {
  deviceInfo: DeviceInfo; // see Requests/Responses spec
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

export class TonConnect implements TonConnectBridge {
  lastTonProtocolVersion: number | undefined;
  lastTonMessage: TonConnectRequest | undefined;
  callbacks: TonConnectCallback[] = [];

  deviceInfo: DeviceInfo = getDeviceInfo();
  protocolVersion = 2;
  isWalletBrowser = true;

  constructor(private provider: TonProvider, tonconnect?: TonConnect) {
    if (tonconnect) {
      this.callbacks = tonconnect.callbacks;
      this.lastTonProtocolVersion = tonconnect.lastTonProtocolVersion;
      this.lastTonMessage = tonconnect.lastTonMessage;
    }
  }

  connect = async (
    protocolVersion: number,
    message: TonConnectRequest
  ): Promise<ConnectEvent> => {
    if (protocolVersion > this.protocolVersion) {
      return this.notify(
        formatConnectEventError(
          new TonConnectError("Unsupported protocol version")
        )
      );
    }
    this.lastTonProtocolVersion = protocolVersion;
    this.lastTonMessage = message;
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
            new TonConnectError((e as Error).message ?? "Unknown error")
          )
        );
      }
    }
  };
  restoreConnection = async (): Promise<ConnectEvent> => {
    if (!this.lastTonMessage || !this.lastTonProtocolVersion) {
      return this.notify(
        formatConnectEventError(
          new TonConnectError("Missing connection message")
        )
      );
    } else {
      return await this.connect(
        this.lastTonProtocolVersion,
        this.lastTonMessage
      );
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

  notify = (event: ConnectEvent) => {
    this.callbacks.forEach((item) => item(event));
    return event;
  };
}
