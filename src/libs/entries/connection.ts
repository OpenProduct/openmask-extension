import { Permission } from "./permission";

export type Connection = {
  logo: string | null;
  connect: {
    [address: string]: Permission[];
  };
};

export type Connections = {
  [origin: string]: Connection;
};

export const defaultConnections: Connections = {};
