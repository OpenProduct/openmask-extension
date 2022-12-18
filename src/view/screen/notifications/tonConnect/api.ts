import {
  Address,
  ALL,
  base64ToBytes,
  bytesToBase64,
  Cell,
  hexToBytes,
  sha256_sync,
  TransferParams,
} from "@openproduct/web-sdk";
import { useMutation } from "@tanstack/react-query";
import BN from "bn.js";
import { useContext } from "react";
import { KeyPair } from "tonweb-mnemonic/dist/types";
import nacl from "tweetnacl";
import {
  TonAddressItemReply,
  TonConnectItemReply,
  TonConnectNETWORK,
  TonConnectRequest,
  TonConnectTransactionPayloadMessage,
  TonProofItem,
  TonProofItemReplySuccess,
} from "../../../../libs/entries/notificationMessage";
import { Permission } from "../../../../libs/entries/permission";
import { SendMode } from "../../../../libs/entries/tonSendMode";
import { TonWebTransaction } from "../../../../libs/entries/transaction";
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

const tonConnectSignature = (
  keyPair: KeyPair,
  item: TonProofItem,
  origin: string,
  wallet: string
): TonProofItemReplySuccess => {
  const timestamp = BigInt(Math.round(Date.now() / 1000));
  const timestampBuffer = Buffer.allocUnsafe(8);
  timestampBuffer.writeBigInt64LE(timestamp);

  const domainBuffer = Buffer.from(new URL(origin).origin);
  const domainLengthBuffer = Buffer.allocUnsafe(4);
  domainLengthBuffer.writeInt32LE(domainBuffer.byteLength);

  const address = new Address(wallet);

  const addressWorkchainBuffer = Buffer.allocUnsafe(4);
  addressWorkchainBuffer.writeInt32BE(address.wc);

  const addressBuffer = Buffer.concat([
    addressWorkchainBuffer,
    Buffer.from(address.hashPart),
  ]);

  const messageBuffer = Buffer.concat([
    Buffer.from("ton-proof-item-v2/", "utf8"),
    addressBuffer,
    domainLengthBuffer,
    domainBuffer,
    timestampBuffer,
    Buffer.from(item.payload),
  ]);

  const bufferToSign = Buffer.concat([
    Buffer.from("ffff", "hex"),
    Buffer.from("ton-connect", "utf8"),
    Buffer.from(sha256_sync(messageBuffer)),
  ]);

  const signature = nacl.sign.detached(
    Buffer.from(sha256_sync(bufferToSign)),
    keyPair.secretKey
  );

  const result: TonProofItemReplySuccess = {
    name: "ton_proof",
    proof: {
      timestamp: timestamp.toString(), // 64-bit unix epoch time of the signing operation (seconds)
      domain: {
        lengthBytes: domainBuffer.byteLength, // AppDomain Length
        value: domainBuffer.toString("utf8"), // app domain name (as url part, without encoding)
      },
      signature: bytesToBase64(signature), // base64-encoded signature
      payload: item.payload, // payload from the request
    },
  };

  return result;
};

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
          const keyPair = await getWalletKeyPair(walletState);

          payload.push(
            tonConnectSignature(keyPair, item, origin, walletState.address)
          );
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

export const useLastBocMutation = () => {
  const ton = useContext(TonProviderContext);
  const wallet = useContext(WalletStateContext);
  return useMutation(async () => {
    const [tx]: [TonWebTransaction] = await ton.getTransactions(
      wallet.address,
      1
    );
    return tx.data;
  });
};
