/**
 * Service to handle manage ft and nft request from dApps
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { AssetParams } from "../../entries/asset";
import { EventError } from "../../exception";
import {
  closeCurrentPopUp,
  openShowJettonPopUp,
  openShowNftPopUp,
} from "./notificationService";
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

  let popupId: number | undefined;
  if (params.type === "jetton") {
    popupId = await openShowJettonPopUp(id, params, origin);
  } else {
    popupId = await openShowNftPopUp(id, params, origin);
  }

  try {
    await waitApprove(id, popupId);
    // Approved
    return true;
  } catch (e) {
    // Rejected or close pop up
    return false;
  } finally {
    await closeCurrentPopUp(popupId);
  }
};
