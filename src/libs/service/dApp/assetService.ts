/**
 * Service to handle manage ft and nft request from dApps
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { JettonParams } from "../../entries/asset";
import { EventError } from "../../exception";
import {
  getAccountState,
  getNetwork,
  setAccountState,
} from "../../store/browserStore";
import { getWalletsByOrigin } from "../walletService";
import { closeCurrentPopUp, openShowJettonPopUp } from "./notificationService";
import { waitApprove } from "./utils";

export const showAsset = async (
  id: number,
  origin: string,
  isEvent: boolean,
  params: JettonParams
) => {
  if (!isEvent) {
    throw new EventError();
  }

  const network = await getNetwork();

  const [first] = await getWalletsByOrigin(origin, network);
  const account = await getAccountState(network);
  if (account.activeWallet !== first) {
    await setAccountState({ ...account, activeWallet: first }, network);
  }

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
