import {
  Address,
  ALL,
  base64ToBytes,
  Cell,
  hexToBytes,
  TransferParams,
} from "@openproduct/web-sdk";
import { useMutation } from "@tanstack/react-query";
import BN from "bn.js";
import { useContext } from "react";
import { KeyPair } from "tonweb-mnemonic/dist/types";
import {
  TonAddressItemReply,
  TonConnectItemReply,
  TonConnectNETWORK,
  TonConnectRequest,
  TonConnectTransactionPayloadMessage,
} from "../../../../libs/entries/notificationMessage";
import { Permission } from "../../../../libs/entries/permission";
import { SendMode } from "../../../../libs/entries/tonSendMode";
import { addDAppAccess } from "../../../../libs/state/connectionSerivce";
import {
  getConnections,
  setConnections,
} from "../../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "../../../context";
import { sendBackground } from "../../../event";
import { getWalletKeyPair } from "../../api";
import { WrapperMethod } from "../../home/wallet/send/api";

interface ConnectParams {
  origin: string;
  wallet: string;
  id: number;
  logo: string | null;
  data: TonConnectRequest;
}

export const useAddConnectionMutation = () => {
  const network = useContext(NetworkContext);

  const account = useContext(AccountStateContext);
  const ton = useContext(TonProviderContext);

  return useMutation<void, Error, ConnectParams>(
    async ({ origin, wallet, id, logo, data }) => {
      const walletState = account.wallets.find(
        (item) => item.address === wallet
      );
      if (!walletState) {
        throw new Error("Unexpected wallet state");
      }

      const WalletClass = ALL[walletState.version];
      const walletContract = new WalletClass(ton, {
        publicKey: hexToBytes(walletState.publicKey),
        wc: 0,
      });

      const { stateInit, address } = await walletContract.createStateInit();

      const payload: TonConnectItemReply[] = [];
      for (let item of data.items) {
        if (item.name === "ton_addr") {
          const result: TonAddressItemReply = {
            name: "ton_addr",
            address: address.toString(false),
            network:
              network == "mainnet"
                ? TonConnectNETWORK.MAINNET
                : TonConnectNETWORK.TESTNET,
            walletStateInit: stateInit.toBase64(),
          };
          payload.push(result);
        } else if (item.name === "ton_proof") {
        }
      }

      const connections = await getConnections(network);

      addDAppAccess(connections, logo, origin, [wallet], [Permission.base]);

      await setConnections(connections, network);

      sendBackground.message("approveRequest", { id, payload });
    }
  );
};

export const useKeyPairMutation = () => {
  const wallet = useContext(WalletStateContext);

  return useMutation<KeyPair, Error>(() => {
    return getWalletKeyPair(wallet);
  });
};

export const useSendMutation = () => {
  const contract = useContext(WalletContractContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);

  return useMutation<
    WrapperMethod,
    Error,
    { state: TonConnectTransactionPayloadMessage; keyPair: KeyPair }
  >(async ({ state, keyPair }) => {
    const seqno = await ton.getSeqno(wallet.address);

    const params: TransferParams = {
      secretKey: keyPair.secretKey,
      toAddress: new Address(state.address),
      amount: new BN(state.amount, 10),
      seqno: seqno,
      payload: state.payload
        ? Cell.oneFromBoc(base64ToBytes(state.payload))
        : new Cell(),
      stateInit: state.stateInit
        ? Cell.oneFromBoc(base64ToBytes(state.stateInit))
        : undefined,
      sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
    };

    const method = contract.transfer(params);

    return { method, seqno };
  });
};
