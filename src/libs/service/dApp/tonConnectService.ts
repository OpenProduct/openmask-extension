import { Address, beginCell, storeStateInit } from "@ton/core";
import { selectNetworkConfig } from "../../entries/network";
import {
  TonAddressItemReply,
  TonConnectItemReply,
  TonConnectRequest,
  TonConnectTransactionPayload,
} from "../../entries/notificationMessage";
import { ErrorCode, RuntimeError } from "../../exception";
import { TonConnectAccount } from "../../provider/tonconnect";
import { revokeAllDAppAccess } from "../../state/connectionSerivce";
import {
  getAccountState,
  getConnections,
  getNetwork,
  getNetworkConfig,
  setConnections,
} from "../../store/browserStore";
import memoryStore from "../../store/memoryStore";
import { getWalletContract } from "../transfer/core";
import { getWalletsByOrigin } from "../walletService";
import { getActiveTabLogo, openNotificationPopUp } from "./notificationService";
import {
  checkBaseDAppPermission,
  switchActiveAddress,
  waitApprove,
} from "./utils";

export const tonReConnectRequest = async (
  origin: string
): Promise<TonConnectItemReply[]> => {
  const network = await getNetwork();
  const [walletAddress] = await getWalletsByOrigin(origin, network);
  if (!walletAddress) {
    throw new RuntimeError(ErrorCode.unauthorize, "Missing connected wallet");
  }
  const account = await getAccountState(network);
  const [walletState] = account.wallets.filter(
    (wallet) => wallet.address === walletAddress
  );
  if (!walletAddress) {
    throw new RuntimeError(ErrorCode.unauthorize, "Missing wallet state");
  }

  const contract = getWalletContract(walletState);
  const stateInit = beginCell()
    .storeWritable(storeStateInit(contract.init))
    .endCell();

  const address = new Address(contract.workchain, stateInit.hash());

  const networks = await getNetworkConfig();
  const config = selectNetworkConfig(network, networks);

  const result: TonAddressItemReply = {
    name: "ton_addr",
    address: address.toRawString(),
    network: config.id,
    walletStateInit: stateInit
      .toBoc({ idx: true, crc32: true })
      .toString("base64"),
  };

  return [result];
};

const connectWithNotification = async (
  id: number,
  origin: string,
  data: TonConnectRequest,
  logo: string
) => {
  memoryStore.addNotification({
    kind: "tonConnectRequest",
    id,
    logo,
    origin,
    data,
  });

  try {
    const popupId = await openNotificationPopUp();
    const result = await waitApprove<TonConnectItemReply[]>(id, popupId);

    return result;
  } finally {
    memoryStore.removeNotification(id);
  }
};

export const tonConnectRequest = async (
  id: number,
  origin: string,
  data: TonConnectRequest
) => {
  const logo = await getActiveTabLogo();
  const isTonProof = data.items.some((item) => item.name === "ton_proof");
  if (isTonProof) {
    return connectWithNotification(id, origin, data, logo);
  }
  const reconnect = await tonReConnectRequest(origin).catch(() => null);
  if (reconnect) {
    return reconnect;
  } else {
    return connectWithNotification(id, origin, data, logo);
  }
};

export const tonConnectDisconnect = async (id: number, origin: string) => {
  const network = await getNetwork();
  const connections = await getConnections(network);
  await setConnections(revokeAllDAppAccess(connections, origin), network);
};

export const tonConnectTransaction = async (
  id: number,
  origin: string,
  data: TonConnectTransactionPayload,
  account: TonConnectAccount | undefined
) => {
  console.log(account);

  await checkBaseDAppPermission(origin);
  await switchActiveAddress(origin);

  memoryStore.addNotification({
    kind: "tonConnectSend",
    id,
    logo: await getActiveTabLogo(),
    origin,
    data,
  });

  try {
    const popupId = await openNotificationPopUp();
    const result = await waitApprove<string>(id, popupId);
    return result;
  } finally {
    memoryStore.removeNotification(id);
  }
};
