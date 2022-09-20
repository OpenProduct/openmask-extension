/**
 * Service to handle transactions request from dApps
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { TransactionParams } from "../../entries/transaction";
import {
  ApproveTransaction,
  backgroundEventsEmitter,
  SignRawValue,
} from "../../event";
import { ClosePopUpError, ErrorCode, RuntimeError } from "../../exception";
import {
  getAccountState,
  getNetwork,
  setAccountState,
} from "../../store/browserStore";
import memoryStore from "../../store/memoryStore";
import { getWalletsByOrigin } from "../walletService";
import {
  closeCurrentPopUp,
  openRawSingPopUp,
  openSendTransactionPopUp,
} from "./notificationService";

const waitTransaction = (id: number, popupId?: number) => {
  return new Promise<number>((resolve, reject) => {
    const approve = (options: { params: ApproveTransaction }) => {
      if (options.params.id === id) {
        backgroundEventsEmitter.off("approveTransaction", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        resolve(options.params.seqNo);
      }
    };
    const close = (options: { params: number }) => {
      if (popupId === options.params) {
        backgroundEventsEmitter.off("approveTransaction", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        reject(new ClosePopUpError());
      }
    };
    const cancel = (options: { params: number }) => {
      if (options.params === id) {
        backgroundEventsEmitter.off("approveTransaction", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        reject(new RuntimeError(ErrorCode.reject, "Reject transaction"));
      }
    };
    backgroundEventsEmitter.on("approveTransaction", approve);
    backgroundEventsEmitter.on("rejectRequest", cancel);
    backgroundEventsEmitter.on("closedPopUp", close);
  });
};

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
    const seqNo = await waitTransaction(id, popupId);
    return seqNo;
  } finally {
    memoryStore.setOperation(null);
    await closeCurrentPopUp(popupId);
  }
};

const waitRawSign = (id: number, popupId?: number) => {
  return new Promise<string>((resolve, reject) => {
    const approve = (options: { params: SignRawValue }) => {
      if (options.params.id === id) {
        backgroundEventsEmitter.off("signRaw", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        resolve(options.params.value);
      }
    };
    const close = (options: { params: number }) => {
      if (popupId === options.params) {
        backgroundEventsEmitter.off("signRaw", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        reject(new ClosePopUpError());
      }
    };
    const cancel = (options: { params: number }) => {
      if (options.params === id) {
        backgroundEventsEmitter.off("signRaw", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        reject(new RuntimeError(ErrorCode.reject, "Reject transaction"));
      }
    };
    backgroundEventsEmitter.on("signRaw", approve);
    backgroundEventsEmitter.on("rejectRequest", cancel);
    backgroundEventsEmitter.on("closedPopUp", close);
  });
};

export const signRawValue = async (
  id: number,
  origin: string,
  value: { data: string }
) => {
  const current = memoryStore.getOperation();
  if (current != null) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      "Another operation in progress"
    );
  }

  memoryStore.setOperation({ kind: "rawSing", value: value.data });

  await switchActiveAddress(origin);

  const popupId = await openRawSingPopUp(id, origin);
  try {
    const value = await waitRawSign(id, popupId);
    return value;
  } finally {
    memoryStore.setOperation(null);
    await closeCurrentPopUp(popupId);
  }
};
