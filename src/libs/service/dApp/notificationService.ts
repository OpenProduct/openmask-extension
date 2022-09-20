/**
 * Service methods to manage notification PopUp
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

import { fromNano } from "@openmask/web-sdk";
import { JettonParams } from "../../entries/asset";
import { TransactionParams } from "../../entries/transaction";
import { backgroundEventsEmitter } from "../../event";
import { Logger } from "../../logger";
import ExtensionPlatform from "../extension";

const NOTIFICATION_HEIGHT = 620;
const NOTIFICATION_WIDTH = 380;

let popupId: number | undefined = undefined;

ExtensionPlatform.addOnRemovedListener((windowId) => {
  if (windowId === popupId) {
    backgroundEventsEmitter.emit("closedPopUp", {
      method: "closedPopUp",
      params: windowId,
    });
    popupId = undefined;
  }
});

export const getActiveTabLogo = async () => {
  const [tab] = await ExtensionPlatform.getActiveTabs();
  return encodeURIComponent((tab && tab.favIconUrl) ?? "");
};

const getPopup = async () => {
  const windows = await ExtensionPlatform.getAllWindows();
  return windows
    ? windows.find((win) => {
        return win && win.type === "popup" && win.id === popupId;
      })
    : null;
};

const openPopUp = async (page: string) => {
  const popup = await getPopup();
  if (popup && popup.id) {
    return await ExtensionPlatform.focusWindow(popup.id);
  } else {
    const lastFocused = await ExtensionPlatform.getLastFocusedWindow();
    // Position window in top right corner of lastFocused window.
    const top = lastFocused.top!;
    const left = lastFocused.left! + (lastFocused.width! - NOTIFICATION_WIDTH);

    // create new notification popup
    const popupWindow = await ExtensionPlatform.openWindow({
      url: `index.html#${page}`,
      type: "popup",
      width: NOTIFICATION_WIDTH,
      height: NOTIFICATION_HEIGHT,
      left,
      top,
    });

    popupId = popupWindow.id;
  }
};

export const openConnectDAppPopUp = async (id: number, origin: string) => {
  const params = new URLSearchParams({
    id: String(id),
    origin: encodeURIComponent(origin),
    logo: await getActiveTabLogo(),
  });

  await openPopUp(`/notifications/dapp?${params.toString()}`);
  return popupId;
};

export const openConnectUnlockPopUp = async () => {
  await openPopUp(`/notifications/unlock`);
  return popupId;
};

export const openSwitchChainPopUp = async (
  id: number,
  origin: string,
  network: string
) => {
  const params = new URLSearchParams({
    id: String(id),
    origin: encodeURIComponent(origin),
    logo: await getActiveTabLogo(),
    network: network,
  });

  await openPopUp(`/notifications/network?${params.toString()}`);
  return popupId;
};

export const openShowJettonPopUp = async (
  id: number,
  jetton: JettonParams,
  origin: string
) => {
  const params = new URLSearchParams({
    id: String(id),
    origin: encodeURIComponent(origin),
    logo: await getActiveTabLogo(),
    address: encodeURIComponent(jetton.address),
    symbol: encodeURIComponent(jetton.symbol ?? ""),
    image: encodeURIComponent(jetton.image ?? ""),
    name: encodeURIComponent(jetton.name ?? ""),
  });

  await openPopUp(`/notifications/jetton?${params.toString()}`);
  return popupId;
};

export const closeCurrentPopUp = async (popupId: number | undefined) => {
  if (popupId) {
    try {
      await ExtensionPlatform.closeWindow(popupId);
    } catch (e) {
      Logger.error(e);
    }
  }
};

export const openSendTransactionPopUp = async (
  id: number,
  origin: string,
  props: TransactionParams
) => {
  const params = new URLSearchParams({
    address: encodeURIComponent(props.to),
    amount: encodeURIComponent(fromNano(props.value).toString()),
    comment: props.data ? encodeURIComponent(props.data) : "", // Data could large then url fit
    submit: "1",
    id: String(id),
    origin: encodeURIComponent(origin),
    logo: await getActiveTabLogo(),
  });

  await openPopUp(`/send?${params.toString()}`);

  return popupId;
};

export const openRawSingPopUp = async (id: number, origin: string) => {
  const params = new URLSearchParams({
    id: String(id),
    origin: encodeURIComponent(origin),
    logo: await getActiveTabLogo(),
  });

  await openPopUp(`/notifications/raw?${params.toString()}`);

  return popupId;
};
