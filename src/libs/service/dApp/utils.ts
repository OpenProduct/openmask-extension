/**
 * Utils methods to support services process dApp requests
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { Permission } from "../../entries/permission";
import { backgroundEventsEmitter } from "../../event";
import { ClosePopUpError, ErrorCode, RuntimeError } from "../../exception";
import { getConnections } from "../../store/browserStore";
import { getWalletsByOrigin } from "../walletService";

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

export const getDAppPermissions = async (
  network: string,
  origin: string
): Promise<Permission[]> => {
  const connections = await getConnections(network);
  if (!connections[origin]) return [];

  const [first] = await getWalletsByOrigin(origin, network);

  return connections[origin].connect[first] ?? [];
};
