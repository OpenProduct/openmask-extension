import { getSharedSecret } from "@noble/ed25519";
import { base64ToBytes, Cell } from "@openproduct/web-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { TonClient } from "ton";
import { KeyPair } from "tonweb-mnemonic/dist/types";
import nacl from "tweetnacl";
import { encodeBase64 } from "tweetnacl-util";
import {
  TonWebTransaction,
  TonWebTransactionInMessage,
  TonWebTransactionMessageRaw,
  TonWebTransactionOutMessage,
} from "../../../../../libs/entries/transaction";
import { getWalletPublicKey } from "../../../../../libs/service/transfer/payload";
import { QueryType } from "../../../../../libs/store/browserStore";
import {
  NetworkContext,
  TonClientContext,
  TonProviderContext,
  WalletStateContext,
} from "../../../../context";
import { useDecryptAnalytics } from "../../../Analytics";
import { getWalletKeyPair } from "../../../api";

const decryptMessage = (
  sharedKey: Uint8Array,
  rawMessage: TonWebTransactionMessageRaw
) => {
  const cell = Cell.oneFromBoc(base64ToBytes(rawMessage.body));
  const messageWithNonceAsUint8Array = cell.bits.array;

  const nonce = messageWithNonceAsUint8Array.slice(0, nacl.box.nonceLength);
  const message = messageWithNonceAsUint8Array.slice(
    nacl.box.nonceLength,
    messageWithNonceAsUint8Array.length
  );

  const decrypted = nacl.box.open.after(message, nonce, sharedKey);

  return decrypted ? encodeBase64(decrypted) : undefined;
};

const decryptOutMessage = async (
  client: TonClient,
  keyPair: KeyPair,
  outMessage: TonWebTransactionOutMessage
): Promise<TonWebTransactionOutMessage> => {
  const senderPublicKey = await getWalletPublicKey(
    client,
    outMessage.destination
  );
  const sharedKey = await getSharedSecret(
    Buffer.from(keyPair.secretKey.slice(0, 32)).toString("hex"),
    senderPublicKey
  );
  if (outMessage.msg_data["@type"] === "msg.dataRaw") {
    return {
      ...outMessage,
      msg_data: {
        ...outMessage.msg_data,
        openmask_decrypted_payload: decryptMessage(
          sharedKey,
          outMessage.msg_data
        ),
      },
    };
  }
  return outMessage;
};

const decryptInMessage = async (
  client: TonClient,
  keyPair: KeyPair,
  inMessage: TonWebTransactionInMessage
): Promise<TonWebTransactionInMessage> => {
  if (!(inMessage.msg_data["@type"] === "msg.dataRaw" && inMessage.source)) {
    return inMessage;
  }

  const senderPublicKey = await getWalletPublicKey(client, inMessage.source);
  const sharedKey = await getSharedSecret(
    Buffer.from(keyPair.secretKey.slice(0, 32)).toString("hex"),
    senderPublicKey
  );

  return {
    ...inMessage,
    msg_data: {
      ...inMessage.msg_data,
      openmask_decrypted_payload: decryptMessage(sharedKey, inMessage.msg_data),
    },
  };
};

const tryToDecrypt = async (
  client: TonClient,
  keyPair: KeyPair,
  transaction: TonWebTransaction
): Promise<TonWebTransaction> => {
  const decryptedOutMessages = await Promise.all(
    transaction.out_msgs.map((outMessage) =>
      decryptOutMessage(client, keyPair, outMessage).catch(() => outMessage)
    )
  );

  const inMessage = await decryptInMessage(
    client,
    keyPair,
    transaction.in_msg
  ).catch(() => transaction.in_msg);

  return {
    ...transaction,
    in_msg: inMessage,
    out_msgs: decryptedOutMessages,
  };
};

export const useDecryptMutation = () => {
  const client = useContext(TonClientContext);
  const wallet = useContext(WalletStateContext);
  const track = useDecryptAnalytics();

  return useMutation<TonWebTransaction[], Error, TonWebTransaction[]>(
    async (transactions) => {
      const keyPair = await getWalletKeyPair(wallet);
      const result = [] as TonWebTransaction[];

      for (const transaction of transactions) {
        if (transaction.out_msgs.length > 1) {
          result.push(transaction);
        } else {
          try {
            result.push(await tryToDecrypt(client, keyPair, transaction));
            track();
          } catch (e) {
            result.push(transaction);
          }
        }
      }
      return result;
    }
  );
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
