/**
 * Utils methods to support services process dApp requests
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { backgroundEventsEmitter } from "../../event";
import { ClosePopUpError, ErrorCode, RuntimeError } from "../../exception";
import { getConnections } from "../../store/browserStore";

export const getWalletsByOrigin = async (origin: string, network: string) => {
  const whitelist = await getConnections(network);
  const account = whitelist[origin];
  if (account == null) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      `Origin "${origin}" is not in whitelist`
    );
  }

  const wallets = Object.keys(account.connect);
  if (wallets.length === 0) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      `Origin "${origin}" don't have access to wallets for "${network}"`
    );
  }
  return wallets;
};

export const waitApprove = (id: number, popupId?: number) => {
  return new Promise((resolve, reject) => {
    const approve = (options: { params: number }) => {
      if (options.params === id) {
        backgroundEventsEmitter.off("approveRequest", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        resolve(undefined);
      }
    };
    const close = (options: { params: number }) => {
      if (popupId === options.params) {
        backgroundEventsEmitter.off("approveRequest", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        reject(new ClosePopUpError());
      }
    };
    const cancel = (options: { params: number }) => {
      if (options.params === id) {
        backgroundEventsEmitter.off("approveRequest", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        reject(new RuntimeError(ErrorCode.reject, "Reject request"));
      }
    };
    backgroundEventsEmitter.on("approveRequest", approve);
    backgroundEventsEmitter.on("rejectRequest", cancel);
    backgroundEventsEmitter.on("closedPopUp", close);
  });
};
