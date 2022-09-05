import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import browser from "webextension-polyfill";
import { Permission } from "../../../libs/entries/permission";
import {
  getConnections,
  QueryType,
  setConnections,
} from "../../../libs/store/browserStore";
import { NetworkContext } from "../../context";
import { sendBackground } from "../../event";

interface ConnectParams {
  origin: string;
  wallets: string[];
  id: number;
  logo: string | null;
  permissions: Permission[];
}

export const useAddConnectionMutation = () => {
  const network = useContext(NetworkContext);
  return useMutation<void, Error, ConnectParams>(
    async ({ origin, wallets, id, logo, permissions }) => {
      const connections = await getConnections(network);

      const connection = connections[origin] ?? { logo, connect: {} };

      wallets.forEach((wallet) => {
        if (connection.connect[wallet]) {
          connection.connect[wallet].push(...permissions);
        } else {
          connection.connect[wallet] = permissions;
        }
      });

      connections[origin] = connection;

      await setConnections(connections, network);

      sendBackground.message("approveRequest", id);
    }
  );
};

export const useActiveTabs = () => {
  return useQuery<browser.Tabs.Tab | undefined>([QueryType.tabs], async () => {
    const [tab] = await browser.tabs.query({ active: true });
    return tab;
  });
};
