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
  getLockScreen,
  getNetwork,
  getNetworkConfig,
} from "../../store/browserStore";
import memoryStore from "../../store/memoryStore";
import { getWalletsByOrigin } from "../walletService";
import { getActiveTabLogo, openNotificationPopUp } from "./notificationService";
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
  const lookScreen = await getLockScreen();
  if (memoryStore.isLock() && lookScreen) {
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

const openNotificationAndConnect = async (
  id: number,
  origin: string,
  logo: string
) => {
  memoryStore.addNotification({
    kind: "connectDApp",
    id,
    logo,
    origin,
    data: {},
  });

  try {
    const popupId = await openNotificationPopUp();
    await waitApprove(id, popupId);
  } finally {
    memoryStore.removeNotification(id);
  }
};

export const connectDApp = async (
  id: number,
  origin: string,
  isEvent: boolean,
  params?: ConnectDAppParams
): Promise<ConnectDAppOutputParams> => {
  const providerPublicKey = (params && params.publicKey) || false;

  const logo = await getActiveTabLogo();
  const network = await getNetwork();
  const lookScreen = await getLockScreen();
  const permissions = await getDAppPermissions(network, origin);

  const haveOpenNotification =
    !isEvent ||
    (memoryStore.isLock() &&
      lookScreen &&
      !permissions.includes(Permission.locked));

  const reconnect = await getConnectedWallets(
    origin,
    network,
    providerPublicKey
  ).catch(() => null);

  if (reconnect === null || haveOpenNotification) {
    await openNotificationAndConnect(id, origin, logo);
    return await getConnectedWallets(origin, network, providerPublicKey);
  } else {
    return reconnect;
  }
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
