import { JettonParams, NftParams } from "./entries/asset";
import { VerifyAuthenticationResponseJSON } from "./entries/auth";
import {
  ConnectDAppParams,
  DeployInputParams,
  RawSignInputParams,
  SwitchNetworkParams,
} from "./entries/notificationMessage";
import { ProxyConfiguration } from "./entries/proxy";
import { TransactionParams } from "./entries/transaction";
import { EventEmitter } from "./eventEmitter";

export type IEventEmitter<T> = {
  on<Key extends string & keyof T>(
    method: `${Key}`,
    callback: (options: {
      method: `${Key}`;
      id?: number;
      params: T[Key];
    }) => void
  ): void;
  off<Key extends string & keyof T>(
    eventName: `${Key}`,
    callback: (options: {
      method: `${Key}`;
      id?: number;
      params: T[Key];
    }) => void
  ): void;
  emit<Key extends string & keyof T>(
    eventName: `${Key}`,
    params?: { method: `${Key}`; id?: number; params: T[Key] }
  ): void;
};

export type PopUpEventEmitter = IEventEmitter<PupUpEvents>;
export type BackgroundEventsEmitter = IEventEmitter<BackgroundEvents>;

export type AskProcessor<R> = {
  message<Key extends string & keyof PupUpEvents>(
    eventName: `${Key}`,
    params?: PupUpEvents[Key]
  ): R;
};

interface SendOperation {
  wallet: string;
  params: Record<string, string>;
}
interface SendJettonOperation {
  wallet: string;
  minterAddress: string;
  params: Record<string, string>;
}
interface SendNftOperation {
  wallet: string;
  collectionAddress: string;
  address: string;
  params: Record<string, string>;
}

export type NotificationFields<Kind extends string, Value> = {
  kind: Kind;
  id: number;
  logo?: string;
  origin: string;
  data: Value;
};

export type NotificationData =
  | NotificationFields<"deploy", DeployInputParams>
  | NotificationFields<"rawSign", RawSignInputParams>
  | NotificationFields<"personalSign", RawSignInputParams>
  | NotificationFields<"switchNetwork", SwitchNetworkParams>
  | NotificationFields<"importJetton", JettonParams>
  | NotificationFields<"importNft", NftParams>
  | NotificationFields<"connectDApp", ConnectDAppParams>
  | NotificationFields<"sendTransaction", TransactionParams>;

export type UnfinishedOperation =
  | null
  | { kind: "send"; value: SendOperation }
  | { kind: "sendJetton"; value: SendJettonOperation }
  | { kind: "sendNft"; value: SendNftOperation };

export interface PupUpEvents {
  isLock: void;
  tryToUnlock: string;
  unlock: void;
  lock: void;
  locked: void;
  getPassword: void;
  setPassword: string;
  approveRequest: PayloadRequest;
  rejectRequest: number;

  confirmSeqNo: number;
  storeOperation: UnfinishedOperation;
  getOperation: void;

  chainChanged: string;
  accountsChanged: string[];
  getWallets: string;

  proxyChanged: ProxyConfiguration;

  getNotification: void;
  closePopUp: number;

  verifyAuthentication: VerifyAuthenticationResponseJSON;
}

export interface PayloadRequest<P = any> {
  id: number;
  payload: P;
}

export interface BackgroundEvents {
  unlock: void;
  locked: void;
  approveRequest: PayloadRequest;
  rejectRequest: number;

  closedPopUp: number;

  chainChanged: string;
  accountsChanged: string[];

  proxyChanged: ProxyConfiguration;
}

export const RESPONSE = "Response";

export type AppEvent<Key extends string, Payload = void> = {
  id?: number;
  method: Key;
  params: Payload;
};

export const popUpEventEmitter: PopUpEventEmitter = new EventEmitter();
export const backgroundEventsEmitter: BackgroundEventsEmitter =
  new EventEmitter();
