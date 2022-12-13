import { TonProvider } from "../provider";
import { ConnectDAppPublicKey } from "./entries/notificationMessage";
import { RuntimeError } from "./exception";
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

export type ConnectItem = TonAddressItem | TonProofItem;

export type TonAddressItem = {
  name: "ton_addr";
};

export type TonProofItem = {
  name: "ton_proof";
  // arbitrary payload, e.g. nonce + expiration timestamp.
  payload: string;
};

export type ConnectRequest = {
  manifestUrl: string;
  return: "back" | "none" | "<my-return-url>";
  items: ConnectItem[]; // data items to share with the app
};

export type ConnectEvent = ConnectEventSuccess | ConnectEventError;

type ConnectItemReply = TonAddressItemReply | TonProofItemReply;

type TonAddressItemReply = {
  name: "ton_addr";
  address: string; // TON address raw (`0:<hex>`)
  network: NETWORK; // network global_id
  walletStateInit: string; // Base64 (not url safe) encoded stateinit cell for the wallet contract
};

type TonProofItemReply = TonProofItemReplySuccess | TonProofItemReplyError;

type TonProofItemReplySuccess = {
  name: "ton_proof";
  proof: {
    timestamp: string; // 64-bit unix epoch time of the signing operation (seconds)
    domain: {
      lengthBytes: number; // AppDomain Length
      value: string; // app domain name (as url part, without encoding)
    };
    signature: string; // base64-encoded signature
    payload: string; // payload from the request
  };
};

type TonProofItemReplyError = {
  name: "ton_addr";
  error: {
    code: number;
    message?: string;
  };
};

enum NETWORK {
  MAINNET = "-239",
  TESTNET = "-3",
}

type ConnectEventSuccess = {
  event: "connect";
  payload: {
    items: ConnectItemReply[];
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

type AppRequest = SendTransactionRequest;

interface TransactionPayload {
  valid_until: 1658253458;
  messages: [
    {
      address: "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F";
      amount: "20000000";
      initState: "base64bocblahblahblah=="; //deploy contract
    },
    {
      address: "0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3";
      amount: "60000000";
      payload: "base64bocblahblahblah=="; //transfer nft to new deployed account 0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F
    }
  ];
}

interface SendTransactionRequest {
  method: "sendTransaction";
  params: [TransactionPayload];
  return: "back" | "none" | "<my-return-url>";
  id: number;
}

type WalletResponse = WalletResponseSuccess | WalletResponseError;

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
  payload: "<event-payload>"; // specific payload for each event
}

type WalletEventName = "connect" | "connect_error" | "disconnect";

export interface TonConnectBridge {
  deviceInfo: DeviceInfo; // see Requests/Responses spec
  protocolVersion: number; // max supported Ton Connect version (e.g. 2)
  isWalletBrowser: boolean; // if the page is opened into wallet's browser
  connect(
    protocolVersion: number,
    message: ConnectRequest
  ): Promise<ConnectEvent>;
  restoreConnection(): Promise<ConnectEvent>;
  send(message: AppRequest): Promise<WalletResponse>;
  listen(callback: (event: WalletEvent) => void): () => void;
}

export const formatTonConnectSuccess = (
  network: string,
  wallets: ConnectDAppPublicKey[],
  message: ConnectRequest,
  protocolVersion: number
): ConnectEventSuccess => {
  return {
    event: "connect",
    payload: {
      items: message.items.map((item) => {
        if (item.name === "ton_addr") {
          const result: TonAddressItemReply = {
            name: "ton_addr",
            address: wallets[0].address,
            network: network === "mainnet" ? NETWORK.MAINNET : NETWORK.TESTNET,
            walletStateInit: wallets[0].publicKey,
          };
          return result;
        } else {
          throw new RuntimeError(400, item.name);
        }
      }),
      device: getDeviceInfo(),
    },
  };
};
export const formatTonConnectError = (e: any): ConnectEventError => {
  return {
    event: "connect_error",
    payload: {
      code: 0, // (e as RuntimeError).code, // map codes
      message: (e as RuntimeError).description ?? "Unknown error",
    },
  };
};

type TonConnectCallback = (event: WalletEvent) => void;

export class TonConnect implements TonConnectBridge {
  lastTonProtocolVersion: number | undefined;
  lastTonMessage: ConnectRequest | undefined;
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
    message: ConnectRequest
  ): Promise<ConnectEvent> => {
    this.lastTonProtocolVersion = protocolVersion;
    this.lastTonMessage = message;
    try {
      const network = await this.provider.send<string>("wallet_getChain");
      const wallets: ConnectDAppPublicKey[] = await this.provider.send(
        "ton_requestWallets"
      );
      return formatTonConnectSuccess(
        network,
        wallets,
        message,
        protocolVersion
      );
    } catch (e) {
      return formatTonConnectError(e);
    }
  };
  restoreConnection = async (): Promise<ConnectEvent> => {
    try {
      const network = await this.provider.send<string>("wallet_getChain");
      const wallets = await this.provider.send<ConnectDAppPublicKey[]>(
        "ton_requestWallets"
      );
      return formatTonConnectSuccess(
        network,
        wallets,
        this.lastTonMessage!,
        this.lastTonProtocolVersion!
      );
    } catch (e) {
      return formatTonConnectError(e);
    }
  };

  send(message: AppRequest): Promise<WalletResponse> {
    throw new Error("Method not implemented.");
  }

  listen = (callback: (event: WalletEvent) => void): (() => void) => {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((item) => item != callback);
    };
  };
}
