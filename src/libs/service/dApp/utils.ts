/**
 * Utils methods to support services process dApp requests
 *
 * @author: KuznetsovNikita
 * @since: 0.6.1
 */

import { Permission } from "../../entries/permission";
import { backgroundEventsEmitter, PayloadRequest } from "../../event";
import { ClosePopUpError, ErrorCode, RuntimeError } from "../../exception";
import {
  getAccountState,
  getConnections,
  getNetwork,
  setAccountState,
} from "../../store/browserStore";
import { getWalletsByOrigin } from "../walletService";

export const waitApprove = <Payload>(id: number, popupId?: number) => {
  return new Promise<Payload>((resolve, reject) => {
    const approve = (options: { params: PayloadRequest<Payload> }) => {
      if (options.params.id === id) {
        backgroundEventsEmitter.off("approveRequest", approve);
        backgroundEventsEmitter.off("rejectRequest", cancel);
        backgroundEventsEmitter.off("closedPopUp", close);
        resolve(options.params.payload);
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
  origin: string,
  wallet?: string
): Promise<Permission[]> => {
  const connections = await getConnections(network);
  if (!connections[origin]) return [];

  if (!wallet) {
    [wallet] = await getWalletsByOrigin(origin, network);
  }

  return connections[origin].connect[wallet] ?? [];
};

export const checkBaseDAppPermission = async (
  origin: string,
  wallet?: string
) => {
  const network = await getNetwork();
  const permissions = await getDAppPermissions(network, origin, wallet);
  if (!permissions.some((item) => item === Permission.base)) {
    throw new RuntimeError(
      ErrorCode.unauthorize,
      `The origin "${origin}" don't have permissions to use a wallet.`
    );
  }
};

export const switchActiveAddress = async (origin: string, from?: string) => {
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
