import { EventEmitter, IEventEmitter } from "./entries/eventEmitter";
import { LedgerTransfer } from "./service/transfer/ledger";

export interface PupUpInternalEvents {
  LedgerTransaction: LedgerTransfer;
  getWebAuthn: void;
  getPassword: void;
  response: any;
}

export type PopUpInternalEventEmitter = IEventEmitter<PupUpInternalEvents>;

export const popUpInternalEventEmitter: PopUpInternalEventEmitter =
  new EventEmitter();
