import { useMutation, useQuery } from "@tanstack/react-query";
import browser from "webextension-polyfill";
import {
  getConnections,
  QueryType,
  setConnections,
} from "../../../libs/browserStore";
import { sendBackground } from "../../event";

export const useAddConnectionMutation = () => {
  return useMutation<
    void,
    Error,
    { origin: string; wallets: string[]; id: number; logo: string | null }
  >(async ({ origin, wallets, id, logo }) => {
    const connections = await getConnections();

    connections[origin] = { wallets, logo };

    await setConnections(connections);

    sendBackground.message("approveRequest", id);
  });
};

export const useActiveTabs = () => {
  return useQuery<browser.Tabs.Tab | undefined>([QueryType.tabs], async () => {
    const [tab] = await browser.tabs.query({ active: true });
    return tab;
  });
};
