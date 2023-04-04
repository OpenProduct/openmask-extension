/**
 * Service methods to manage connection state for application
 * The file should contain pure function to mutate state
 *
 * @author: KuznetsovNikita
 * @since: 0.7.0
 */

import { Connection, Connections } from "../entries/connection";
import { Permission } from "../entries/permission";

export const addDAppAccess = (
  connections: Connections,
  logo: string | null,
  origin: string,
  wallets: string[],
  permissions: Permission[]
) => {
  const connection: Connection = { logo, connect: {} };

  wallets.forEach((wallet) => {
    connection.connect[wallet] = permissions;
  });

  connections[origin] = connection;

  return connections;
};

export interface WalletConnection {
  origin: string;
  logo: string | null;
}

export const getWalletConnections = (
  connections: Connections,
  wallet: string
) => {
  return Object.entries(connections).reduce(
    (acc, [origin, { logo, connect }]) => {
      if (Object.keys(connect).includes(wallet)) {
        acc.push({ origin, logo });
      }
      return acc;
    },
    [] as WalletConnection[]
  );
};

export const revokeDAppAccess = (
  connections: Connections,
  origin: string,
  wallet: string
): Connections => {
  if (!connections[origin]) {
    return connections;
  }

  delete connections[origin].connect[wallet];

  if (Object.keys(connections[origin].connect).length === 0) {
    delete connections[origin];
  }

  return connections;
};

export const revokeAllDAppAccess = (
  connections: Connections,
  origin: string
): Connections => {
  if (!connections[origin]) {
    return connections;
  }
  delete connections[origin];
  return connections;
};

export const updateWalletAddress = (
  connections: Connections,
  oldAddress: string,
  address: string
): Connections => {
  Object.values(connections).forEach((item) => {
    const permission = item.connect[oldAddress];
    if (permission) {
      item.connect[address] = permission;
      delete item.connect[oldAddress];
    }
  });
  return connections;
};
