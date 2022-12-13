export {};

interface ITonProvider {
  nextJsonRpcId;
  callbacks: Record<string, any>;
  promises: Record<
    string,
    {
      resolve: (value: unknown) => void;
      reject: (reason?: any) => void;
    }
  >;
  nextJsonRpcId: number;
  destroy: () => void;
  tonconnect: TonConnectBridge;
}

declare global {
  interface Window {
    ton: ITonProvider;
    openMask: ITonProvider;
    tonProtocolVersion: number;
  }
}
