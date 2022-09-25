/**
 * Service to handle transactions request from dApps
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { TransactionParams } from "../../entries/transaction";
import { ErrorCode, RuntimeError } from "../../exception";
import memoryStore from "../../store/memoryStore";
import { confirmWalletSeqNo, getActiveWallet } from "../walletService";
import {
  closeCurrentPopUp,
  openPersonalSingPopUp,
  openRawSingPopUp,
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
  const current = memoryStore.getOperation();
  if (current != null) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      "Another operation in progress"
    );
  }

  await switchActiveAddress(origin, wallet);

  memoryStore.setOperation({ kind: "sign", value: value.data });

  const popupId = await openRawSingPopUp(id, origin);

  try {
    const value = await waitApprove<string>(id, popupId);
    return value;
  } finally {
    memoryStore.setOperation(null);
    await closeCurrentPopUp(popupId);
  }
};

export const signPersonalValue = async (
  id: number,
  origin: string,
  value: { data: string },
  wallet?: string
) => {
  await checkBaseDAppPermission(origin, wallet);
  const current = memoryStore.getOperation();
  if (current != null) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      "Another operation in progress"
    );
  }

  await switchActiveAddress(origin, wallet);

  memoryStore.setOperation({ kind: "sign", value: value.data });

  try {
    const popupId = await openPersonalSingPopUp(id, origin);

    try {
      const signature = await waitApprove<string>(id, popupId);
      return signature;
    } finally {
      await closeCurrentPopUp(popupId);
    }
  } finally {
    memoryStore.setOperation(null);
  }
};
