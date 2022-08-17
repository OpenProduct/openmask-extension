export type AppEventEmitter = {
  on<Key extends string & keyof AppEvents>(
    method: `${Key}`,
    callback: (options: {
      method: `${Key}`;
      id?: number;
      params: AppEvents[Key];
    }) => void
  ): void;
  off<Key extends string & keyof AppEvents>(
    eventName: `${Key}`,
    callback: (options: {
      method: `${Key}`;
      id?: number;
      params: AppEvents[Key];
    }) => void
  ): void;
  emit<Key extends string & keyof AppEvents>(
    eventName: `${Key}`,
    params: { method: `${Key}`; id?: number; params: AppEvents[Key] }
  ): void;
};

export type AskProcessor<R> = {
  message<Key extends string & keyof AppEvents>(
    eventName: `${Key}`,
    params?: AppEvents[Key]
  ): R;
};

export interface AppEvents {
  isLock: void;
  tryToUnlock: string;
  unlock: void;
  lock: void;
  locked: void;
  getPassword: void;
  setPassword: string;
}

export const RESPONSE = "Response";

export type AppEvent<Key extends string, Payload = void> = {
  id?: number;
  method: Key;
  params: Payload;
};
