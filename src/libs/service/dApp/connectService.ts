/**
 * Service methods to request wallets access
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

import { TonHttpProvider } from "@openproduct/web-sdk";
import { selectNetworkConfig } from "../../entries/network";
import {
  ConnectDAppOutputParams,
  ConnectDAppParams,
} from "../../entries/notificationMessage";
import { Permission } from "../../entries/permission";
import { backgroundEventsEmitter } from "../../event";
import { ClosePopUpError, ErrorCode, RuntimeError } from "../../exception";
import { Logger } from "../../logger";
import {
  getAccountState,
  getConnections,
  getNetwork,
  getNetworkConfig,
} from "../../store/browserStore";
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

export const getConnectedWallets = async (
  origin: string,
  network: string,
  providerPublicKey: boolean
): Promise<ConnectDAppOutputParams> => {
  if (memoryStore.isLock()) {
    const permissions = await getDAppPermissions(network, origin);

    if (!permissions.includes(Permission.locked)) {
      throw new RuntimeError(ErrorCode.unauthorize, `Application locked`);
    }
  }

  const wallets = await getWalletsByOrigin(origin, network);
  if (!providerPublicKey) {
    return wallets;
  }
  const account = await getAccountState(network);

  return wallets.map((address) => {
    const [state] = account.wallets.filter(
      (wallet) => wallet.address === address
    );
    return {
      address,
      version: state.version,
      publicKey: state.publicKey,
    };
  });
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
  isEvent: boolean,
  params?: ConnectDAppParams
) => {
  const providerPublicKey = (params && params.publicKey) || false;

  const network = await getNetwork();
  if (!isEvent) {
    return await getConnectedWallets(origin, network, providerPublicKey);
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
  return await getConnectedWallets(origin, network, providerPublicKey);
};

export const getBalance = async (
  origin: string,
  wallet: string | undefined
) => {
  await checkBaseDAppPermission(origin, wallet);
  const network = await getNetwork();
  const networks = await getNetworkConfig();
  const config = selectNetworkConfig(network, networks);

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
