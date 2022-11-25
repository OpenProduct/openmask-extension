import { EventEmitter, IEventEmitter } from "./entries/eventEmitter";

export interface PupUpInternalEvents {
  getWebAuthn: void;
  response: any;
}

export type PopUpInternalEventEmitter = IEventEmitter<PupUpInternalEvents>;

export const popUpInternalEventEmitter: PopUpInternalEventEmitter =
  new EventEmitter();
