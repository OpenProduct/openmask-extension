/**
 * Service to handle transactions request from dApps
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { TransactionParams } from "../../entries/transaction";
import { ErrorCode, RuntimeError } from "../../exception";
import {
  getAccountState,
  getNetwork,
  setAccountState,
} from "../../store/browserStore";
import memoryStore from "../../store/memoryStore";
import { getWalletsByOrigin } from "../walletService";
import {
  closeCurrentPopUp,
  openPersonalSingPopUp,
  openRawSingPopUp,
  openSendTransactionPopUp,
} from "./notificationService";
import { checkBaseDAppPermission, waitApprove } from "./utils";

const switchActiveAddress = async (origin: string, from?: string) => {
  const network = await getNetwork();
  const wallets = await getWalletsByOrigin(origin, network);
  const account = await getAccountState(network);

  if (!from) {
    // Switch to wallet with use permissions
    if (account.activeWallet !== wallets[0]) {
      await setAccountState({ ...account, activeWallet: wallets[0] }, network);
    }
    return;
  }

  const address = wallets.find((item) => item === from);
  if (!address) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      `Don't have an access to wallet "${from}"`
    );
  }

  if (account.activeWallet !== address) {
    await setAccountState({ ...account, activeWallet: address }, network);
  }
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
  value: { data: string }
) => {
  await checkBaseDAppPermission(origin);
  const current = memoryStore.getOperation();
  if (current != null) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      "Another operation in progress"
    );
  }

  await switchActiveAddress(origin);

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
  value: { data: string }
) => {
  await checkBaseDAppPermission(origin);
  const current = memoryStore.getOperation();
  if (current != null) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      "Another operation in progress"
    );
  }

  await switchActiveAddress(origin);

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
