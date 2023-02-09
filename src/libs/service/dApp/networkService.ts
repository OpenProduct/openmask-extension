/**
 * Service to handle manage network request from dApps
 *
 * @author: KuznetsovNikita
 * @since: 0.1.0
 */

import { Permission } from "../../entries/permission";
import { backgroundEventsEmitter } from "../../event";
import { ErrorCode, EventError, RuntimeError } from "../../exception";
import {
  getNetwork,
  getNetworkConfig,
  QueryType,
  setStoreValue,
} from "../../store/browserStore";
import memoryStore from "../../store/memoryStore";
import { getActiveTabLogo, openNotificationPopUp } from "./notificationService";
import { getDAppPermissions, waitApprove } from "./utils";

export const switchChain = async (
  id: number,
  origin: string,
  isEvent: boolean,
  network: string
) => {
  const current = await getNetwork();
  if (current === network) {
    throw new RuntimeError(
      ErrorCode.unexpectedParams,
      `Wallet already use "${network}" network`
    );
  }
  const networks = await getNetworkConfig();
  if (networks.find((item) => item.name === network) == null) {
    throw new RuntimeError(
      ErrorCode.unexpectedParams,
      `Wallet don't have configuration for "${network}" network`
    );
  }

  const permissions = await getDAppPermissions(current, origin);

  // DApp have permission to change network
  if (permissions.includes(Permission.switchNetwork)) {
    await setStoreValue(QueryType.network, network);
    backgroundEventsEmitter.emit("chainChanged", {
      method: "chainChanged",
      params: network,
    });
    return;
  }

  // Show PopUp to ask confirmation to change network
  if (!isEvent) {
    throw new EventError();
  }

  memoryStore.addNotification({
    kind: "switchNetwork",
    id,
    logo: await getActiveTabLogo(),
    origin,
    data: { network },
  });

  try {
    const popupId = await openNotificationPopUp();
    return await waitApprove(id, popupId);
  } finally {
    memoryStore.removeNotification(id);
  }
};
