import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import {
  TonWebTransaction,
  TonWebTransactionDecryptedMessageRaw,
  TonWebTransactionMessageRaw,
  TonWebTransactionOutMessage, TonWebTransactionOutMessageWithDecryptedPayload,
  TonWebTransactionWithDecryptedPayload
} from "../../../../../libs/entries/transaction";
import { QueryType } from "../../../../../libs/store/browserStore";
import {
  NetworkContext,
  TonProviderContext,
  WalletStateContext,
} from "../../../../context";
import {getSharedSecret} from "@noble/ed25519";
import {
  base64ToBytes,
  bytesToHex, Cell,
  TonHttpProvider
} from "@openproduct/web-sdk";
import nacl from "tweetnacl";
import { getPublicKey, getWalletKeyPair } from "../../../api";
import { KeyPair } from "tonweb-mnemonic/dist/types";
import { encodeBase64 } from "tweetnacl-util";

function assertFullfilled<T>(item:  PromiseSettledResult<T>): item is PromiseSettledResult<T> {
  return item.status === "fulfilled";
}

const decryptMessage = (sharedKey: Uint8Array, rawMessage:  TonWebTransactionMessageRaw) => {
    const cell = Cell.oneFromBoc(base64ToBytes(rawMessage.body));
    const messageWithNonceAsUint8Array = cell.bits.array;


    const nonce = messageWithNonceAsUint8Array.slice(0, nacl.box.nonceLength);
    const message = messageWithNonceAsUint8Array.slice(
      nacl.box.nonceLength,
      messageWithNonceAsUint8Array.length
    );

    const decrypted = nacl.box.open.after(
      message,
      nonce,
      sharedKey
    );

    return decrypted ? encodeBase64(decrypted) : undefined;
};


const decryptOutMessage = async (ton: TonHttpProvider, keyPair: KeyPair, outMessage: TonWebTransactionOutMessage): Promise<TonWebTransactionOutMessageWithDecryptedPayload> => {
  const senderPublicKey = await getPublicKey(ton, outMessage.destination);
  const sharedKey = await getSharedSecret(bytesToHex(keyPair.secretKey.slice(0, 32)), senderPublicKey);
  if(outMessage.msg_data["@type"] === "msg.dataRaw") {
    return {
      ...outMessage,
      msg_data: {
        ...outMessage.msg_data,
        decrypted_payload: decryptMessage(sharedKey, outMessage.msg_data)
      }
    };
  }
  return outMessage;
};

const toDecrypt = async (ton: TonHttpProvider, keyPair: KeyPair, transaction: TonWebTransaction): Promise<TonWebTransactionWithDecryptedPayload> => {
  const decryptedOutMessages = (await Promise.allSettled(transaction.out_msgs.map(
    async (outMessage) =>
      await decryptOutMessage(ton, keyPair, outMessage)))).filter(assertFullfilled)
    .map((item) => (item as PromiseFulfilledResult<TonWebTransactionOutMessageWithDecryptedPayload>).value);

  const inMsgData = {
    ...transaction.in_msg.msg_data,
  };

  if(transaction.in_msg.msg_data["@type"] === "msg.dataRaw" && transaction.in_msg.source) {
    const senderPublicKey = await getPublicKey(ton, transaction.in_msg.source);
    const sharedKey = await getSharedSecret(bytesToHex(keyPair.secretKey.slice(0, 32)), senderPublicKey);
    (inMsgData as TonWebTransactionDecryptedMessageRaw)["decrypted_payload"] = decryptMessage(sharedKey, transaction.in_msg.msg_data);
  }

  return {
    ...transaction,
    in_msg: {
      ...transaction.in_msg,
      msg_data: inMsgData
    },
    out_msgs: decryptedOutMessages
  };
};

export const useDecryptPayload = (transactions: TonWebTransaction[] | undefined) => {
  const ton = useContext(TonProviderContext);
  const wallet = useContext(WalletStateContext);

  return useQuery([transactions, wallet.address, QueryType.encryptedPayload], async () => {
    const keyPair = await getWalletKeyPair(wallet);
    if(transactions) {
      return (await Promise.allSettled(transactions.map(async (transaction) => await toDecrypt(ton, keyPair, transaction))))
        .filter(assertFullfilled)
        .map((item) => (item as PromiseFulfilledResult<TonWebTransactionWithDecryptedPayload>).value)
    }
  }, {
    enabled: Boolean(transactions)
  });
};

export const useTransactions = (limit: number = 10) => {
  const network = useContext(NetworkContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);

  return useQuery<TonWebTransaction[], Error>(
    [network, wallet.address, QueryType.transactions],
    () => ton.getTransactions(wallet.address, limit)
  );
};
