import ExtensionPlatform from "./extension";

const NOTIFICATION_HEIGHT = 620;
const NOTIFICATION_WIDTH = 380;

let popupId: number | undefined = undefined;

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

export const openConnectDAppPopUp = async (
  id: number,
  origin: string,
  logo?: string
) => {
  await openPopUp(
    `/connect/dapp?origin=${encodeURIComponent(
      origin
    )}&id=${id}&logo=${encodeURIComponent(logo ?? "")}`
  );
  return popupId;
};

export const openConnectUnlockPopUp = async () => {
  await openPopUp(`/connect/unlock`);
  return popupId;
};

export const closeCurrentPopUp = async (popupId: number | undefined) => {
  if (popupId) {
    await ExtensionPlatform.closeWindow(popupId);
  }
};
