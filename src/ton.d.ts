export {};

interface Ton {
  listeners: Record<string, any>;
  _promises: Record<string, any>;
  _nextJsonRpcId: number;
  _destroy: () => void;
}

declare global {
  interface Window {
    ton: Ton;
  }
}
