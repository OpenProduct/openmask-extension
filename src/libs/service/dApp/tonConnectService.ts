import { ALL, hexToBytes, TonHttpProvider } from "@openproduct/web-sdk";
import { getNetworkConfig } from "../../entries/network";
import {
  TonAddressItemReply,
  TonConnectItemReply,
  TonConnectNETWORK,
  TonConnectRequest,
  TonConnectTransactionPayload,
} from "../../entries/notificationMessage";
import { revokeAllDAppAccess } from "../../state/connectionSerivce";
import {
  getAccountState,
  getConnections,
  getNetwork,
  setConnections,
} from "../../store/browserStore";
import memoryStore from "../../store/memoryStore";
import { getWalletsByOrigin } from "../walletService";
import { getActiveTabLogo, openNotificationPopUp } from "./notificationService";
import {
  checkBaseDAppPermission,
  switchActiveAddress,
  waitApprove,
} from "./utils";

const tonReconnect = async (origin: string): Promise<TonConnectItemReply[]> => {
  const network = await getNetwork();
  const [walletAddress] = await getWalletsByOrigin(origin, network);
  const account = await getAccountState(network);
  const [walletState] = account.wallets.filter(
    (wallet) => wallet.address === walletAddress
  );

  const config = getNetworkConfig(network);

  const provider = new TonHttpProvider(config.rpcUrl, {
    apiKey: config.apiKey,
  });

  const WalletClass = ALL[walletState.version];
  const walletContract = new WalletClass(provider, {
    publicKey: hexToBytes(walletState.publicKey),
    wc: 0,
  });

  const { stateInit, address } = await walletContract.createStateInit();
  const result: TonAddressItemReply = {
    name: "ton_addr",
    address: address.toString(false),
    network:
      network == "mainnet"
        ? TonConnectNETWORK.MAINNET
        : TonConnectNETWORK.TESTNET,
    walletStateInit: stateInit.toBase64(),
  };

  return [result];
};

export const tonConnectRequest = async (
  id: number,
  origin: string,
  data: TonConnectRequest
) => {
  const whitelist = await getConnections();
  const isTonProof = data.items.some((item) => item.name === "ton_proof");

  if (whitelist[origin] == null || isTonProof) {
    memoryStore.addNotification({
      kind: "tonConnectRequest",
      id,
      logo: await getActiveTabLogo(),
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
  } else {
    return tonReconnect(origin);
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
  data: TonConnectTransactionPayload
) => {
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
