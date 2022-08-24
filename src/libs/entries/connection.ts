export type Connections = {
  [origin: string]: { wallets: string[]; logo: string | null };
};

export const defaultConnections: Connections = {};
