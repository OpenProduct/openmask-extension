/**
 * Service to handle transactions request from dApps
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import {
  DecryptMessageInputParams,
  DeployInputParams,
  DeployOutputParams, EncryptMessageInputParams,
} from "../../entries/notificationMessage";
import { TransactionParams } from "../../entries/transaction";
import { ErrorCode, RuntimeError } from "../../exception";
import memoryStore from "../../store/memoryStore";
import { confirmWalletSeqNo, getActiveWallet } from "../walletService";
import { getActiveTabLogo, openNotificationPopUp } from "./notificationService";
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
  params: TransactionParams,
  wallet?: string
) => {
  await checkBaseDAppPermission(origin);
  const current = memoryStore.getOperation();
  if (current != null) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      "Another operation in progress"
    );
  }

  await switchActiveAddress(origin, wallet);

  memoryStore.addNotification({
    kind: "sendTransaction",
    id,
    logo: await getActiveTabLogo(),
    origin,
    data: params,
  });

  try {
    const popupId = await openNotificationPopUp();
    const seqNo = await waitApprove<number>(id, popupId);
    return seqNo;
  } finally {
    memoryStore.removeNotification(id);
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

export const decryptMessage = async (
  id: number,
  origin: string,
  value: DecryptMessageInputParams,
  wallet?: string
) => {
  await checkBaseDAppPermission(origin, wallet);
  await switchActiveAddress(origin, wallet);

  memoryStore.addNotification({
    kind: "decryptMessage",
    id,
    logo: await getActiveTabLogo(),
    origin,
    data: value,
  });

  try {
    const popupId = await openNotificationPopUp();
    const message = await waitApprove<string>(id, popupId);
    return message;
  } finally {
    memoryStore.removeNotification(id);
  }
};

export const encryptMessage = async (
  id: number,
  origin: string,
  value: EncryptMessageInputParams,
  wallet?: string
) => {
  await checkBaseDAppPermission(origin, wallet);
  await switchActiveAddress(origin, wallet);

  memoryStore.addNotification({
    kind: "encryptMessage",
    id,
    logo: await getActiveTabLogo(),
    origin,
    data: value,
  });

  try {
    const popupId = await openNotificationPopUp();
    const message = await waitApprove<string>(id, popupId);
    return message;
  } finally {
    memoryStore.removeNotification(id);
  }
};
