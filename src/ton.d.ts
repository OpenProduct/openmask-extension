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
}

declare global {
  interface Window {
    ton: ITonProvider;
    openmask: {
      provider: ITonProvider;
      tonconnect: TonConnectBridge;
    };
    tonProtocolVersion: number;
  }
}
