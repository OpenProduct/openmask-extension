/**
 * Service to handle transactions request from dApps
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { TransactionParams } from "../../entries/transaction";
import {
  DeployInputParams,
  DeployOutputParams,
} from "../../entries/transactionMessage";
import { ErrorCode, RuntimeError } from "../../exception";
import memoryStore from "../../store/memoryStore";
import { confirmWalletSeqNo, getActiveWallet } from "../walletService";
import {
  closeCurrentPopUp,
  getActiveTabLogo,
  openNotificationPopUp,
  openSendTransactionPopUp,
} from "./notificationService";
import {
  checkBaseDAppPermission,
  switchActiveAddress,
  waitApprove,
} from "./utils";

export const confirmAccountSeqNo = async (
  origin: string,
  walletSeqNo: number,
  wallet?: string
) => {
  if (!wallet) {
    wallet = await getActiveWallet();
  }
  await checkBaseDAppPermission(origin, wallet);
  return confirmWalletSeqNo(walletSeqNo, wallet);
};

export const sendTransaction = async (
  id: number,
  origin: string,
  params: TransactionParams
) => {
  await checkBaseDAppPermission(origin);
  const current = memoryStore.getOperation();
  if (current != null) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      "Another operation in progress"
    );
  }

  await switchActiveAddress(origin, params.from);

  const popupId = await openSendTransactionPopUp(id, origin, params);
  try {
    const seqNo = await waitApprove<number>(id, popupId);
    return seqNo;
  } finally {
    memoryStore.setOperation(null);
    await closeCurrentPopUp(popupId);
  }
};

export const signRawValue = async (
  id: number,
  origin: string,
  value: { data: string },
  wallet?: string
) => {
  await checkBaseDAppPermission(origin, wallet);
  await switchActiveAddress(origin, wallet);

  memoryStore.addNotification({
    kind: "rawSign",
    id,
    logo: await getActiveTabLogo(),
    origin,
    data: value,
  });

  try {
    const popupId = await openNotificationPopUp();
    const signature = await waitApprove<string>(id, popupId);
    return signature;
  } finally {
    memoryStore.removeNotification(id);
  }
};

export const signPersonalValue = async (
  id: number,
  origin: string,
  value: { data: string },
  wallet?: string
) => {
  await checkBaseDAppPermission(origin, wallet);
  await switchActiveAddress(origin, wallet);

  memoryStore.addNotification({
    kind: "personalSign",
    id,
    logo: await getActiveTabLogo(),
    origin,
    data: value,
  });

  try {
    const popupId = await openNotificationPopUp();
    const signature = await waitApprove<string>(id, popupId);
    return signature;
  } finally {
    memoryStore.removeNotification(id);
  }
};

export const deploySmartContract = async (
  id: number,
  origin: string,
  data: DeployInputParams,
  wallet?: string
) => {
  await checkBaseDAppPermission(origin, wallet);
  await switchActiveAddress(origin, wallet);

  memoryStore.addNotification({
    kind: "deploy",
    id,
    logo: await getActiveTabLogo(),
    origin,
    data,
  });

  try {
    const popupId = await openNotificationPopUp();
    return await waitApprove<DeployOutputParams>(id, popupId);
  } finally {
    memoryStore.removeNotification(id);
  }
};
