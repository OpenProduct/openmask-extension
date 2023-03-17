import { EventEmitter, IEventEmitter } from "./entries/eventEmitter";
import { LadgerTransfer } from "./service/transfer/ladger";

export interface PupUpInternalEvents {
  ladgerTransaction: LadgerTransfer;
  getWebAuthn: void;
  response: any;
}

export type PopUpInternalEventEmitter = IEventEmitter<PupUpInternalEvents>;

export const popUpInternalEventEmitter: PopUpInternalEventEmitter =
  new EventEmitter();
