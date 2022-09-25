/**
 * Service to handle manage ft and nft request from dApps
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { JettonParams } from "../../entries/asset";
import { EventError } from "../../exception";
import { closeCurrentPopUp, openShowJettonPopUp } from "./notificationService";
import {
  checkBaseDAppPermission,
  switchActiveAddress,
  waitApprove,
} from "./utils";

export const showAsset = async (
  id: number,
  origin: string,
  isEvent: boolean,
  params: JettonParams,
  wallet?: string
) => {
  await checkBaseDAppPermission(origin, wallet);
  if (!isEvent) {
    throw new EventError();
  }

  await switchActiveAddress(origin, wallet);

  const popupId = await openShowJettonPopUp(id, params, origin);
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
