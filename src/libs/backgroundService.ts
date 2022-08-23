import { getNetworkStoreValue, QueryType } from "./browserStore";
import { defaultAccountState } from "./entries/account";
import ExtensionPlatform from "./extension";
import { MemoryStore } from "./memoryStore";

const NOTIFICATION_HEIGHT = 620;
const NOTIFICATION_WIDTH = 380;

export const backgroundService = (options: { memStore: MemoryStore }) => {
  const { memStore } = options;

  let popupId: number | undefined = undefined;

  const getPopup = async () => {
    const windows = await ExtensionPlatform.getAllWindows();
    return windows
      ? windows.find((win) => {
          return win && win.type === "popup" && win.id === popupId;
        })
      : null;
  };

  return {
    getActiveWallet: async () => {
      if (memStore.isLock()) {
        throw new Error("Application locked");
      }

      const account = await getNetworkStoreValue(
        QueryType.account,
        defaultAccountState
      );

      if (!account.activeWallet) {
        throw new Error("Active wallet is not define");
      }

      return [account.activeWallet];
    },
    connectDApp: async () => {
      const popup = await getPopup();
      if (popup && popup.id) {
        return await ExtensionPlatform.focusWindow(popup.id);
      } else {
        const lastFocused = await ExtensionPlatform.getLastFocusedWindow();
        // Position window in top right corner of lastFocused window.
        const top = lastFocused.top!;
        const left =
          lastFocused.left! + (lastFocused.width! - NOTIFICATION_WIDTH);

        // create new notification popup
        const popupWindow = await ExtensionPlatform.openWindow({
          url: "index.html#/connect",
          type: "popup",
          width: NOTIFICATION_WIDTH,
          height: NOTIFICATION_HEIGHT,
          left,
          top,
        });

        popupId = popupWindow.id;

        return ["popup-account"];
      }
    },
  };
};
