/**
 * Service to handle manage ft and nft request from dApps
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { AssetParams } from "../../entries/asset";
import { EventError } from "../../exception";
import memoryStore from "../../store/memoryStore";
import { getActiveTabLogo, openNotificationPopUp } from "./notificationService";
import {
  checkBaseDAppPermission,
  switchActiveAddress,
  waitApprove,
} from "./utils";

export const showAsset = async (
  id: number,
  origin: string,
  isEvent: boolean,
  params: AssetParams,
  wallet?: string
) => {
  await checkBaseDAppPermission(origin, wallet);
  if (!isEvent) {
    throw new EventError();
  }
  await switchActiveAddress(origin, wallet);

  if (params.type === "jetton") {
    memoryStore.addNotification({
      kind: "importJetton",
      id,
      logo: await getActiveTabLogo(),
      origin,
      data: params,
    });
  } else {
    memoryStore.addNotification({
      kind: "importNft",
      id,
      logo: await getActiveTabLogo(),
      origin,
      data: params,
    });
  }

  try {
    const popupId = await openNotificationPopUp();
    await waitApprove(id, popupId);
    // Approved
    return true;
  } catch (e) {
    // Rejected or close pop up
    return false;
  } finally {
    memoryStore.removeNotification(id);
  }
};
