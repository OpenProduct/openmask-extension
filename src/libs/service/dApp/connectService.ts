/**
 * Service methods to request wallets access
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

import { TonHttpProvider } from "@openproduct/web-sdk/build/cjs/providers/httpProvider";
import { getNetworkConfig } from "../../entries/network";
import { Permission } from "../../entries/permission";
import { backgroundEventsEmitter } from "../../event";
import { ClosePopUpError, ErrorCode, RuntimeError } from "../../exception";
import { Logger } from "../../logger";
import { getConnections, getNetwork } from "../../store/browserStore";
import memoryStore from "../../store/memoryStore";
import { getWalletsByOrigin } from "../walletService";
import {
  closeCurrentPopUp,
  getActiveTabLogo,
  openNotificationPopUp,
} from "./notificationService";
import {
  checkBaseDAppPermission,
  getDAppPermissions,
  waitApprove,
} from "./utils";

export const getConnectedWallets = async (origin: string, network: string) => {
  if (memoryStore.isLock()) {
    const permissions = await getDAppPermissions(network, origin);

    if (!permissions.includes(Permission.locked)) {
      throw new RuntimeError(ErrorCode.unauthorize, `Application locked`);
    }
  }

  return await getWalletsByOrigin(origin, network);
};

const waitUnlock = (popupId?: number) => {
  return new Promise((resolve, reject) => {
    const close = (options: { params: number }) => {
      if (popupId === options.params) {
        backgroundEventsEmitter.off("closedPopUp", close);
        backgroundEventsEmitter.off("unlock", unlock);
        reject(new ClosePopUpError());
      }
    };

    const unlock = () => {
      backgroundEventsEmitter.off("unlock", unlock);
      resolve(undefined);
    };

    backgroundEventsEmitter.on("unlock", unlock);
    backgroundEventsEmitter.on("closedPopUp", close);
  });
};

export const connectDApp = async (
  id: number,
  origin: string,
  isEvent: boolean
) => {
  const network = await getNetwork();
  if (!isEvent) {
    return await getConnectedWallets(origin, network);
  }
  const whitelist = await getConnections();
  if (whitelist[origin] == null) {
    memoryStore.addNotification({
      kind: "connectDApp",
      id,
      logo: await getActiveTabLogo(),
      origin,
      data: {},
    });

    try {
      const popupId = await openNotificationPopUp();
      await waitApprove(id, popupId);
    } finally {
      memoryStore.removeNotification(id);
    }
  }
  if (memoryStore.isLock()) {
    const permissions = await getDAppPermissions(network, origin);
    if (!permissions.includes(Permission.locked)) {
      const popupId = await openNotificationPopUp();
      try {
        await waitUnlock(popupId);
      } finally {
        await closeCurrentPopUp(popupId);
      }
    }
  }
  return await getConnectedWallets(origin, network);
};

export const getBalance = async (
  origin: string,
  wallet: string | undefined
) => {
  await checkBaseDAppPermission(origin, wallet);
  const network = await getNetwork();
  const config = getNetworkConfig(network);

  const provider = new TonHttpProvider(config.rpcUrl, {
    apiKey: config.apiKey,
  });

  if (wallet) {
    const result = await provider.getBalance(wallet);
    Logger.log({ result });
    return result;
  }

  const [first] = await getWalletsByOrigin(origin, network);
  const result = await provider.getBalance(first);
  Logger.log({ result });
  return result;
};
