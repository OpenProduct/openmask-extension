import { getSharedSecret } from "@noble/ed25519";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { TonClient } from "ton";
import { Cell } from "ton-core";
import { KeyPair } from "tonweb-mnemonic/dist/types";
import nacl from "tweetnacl";
import { encodeBase64 } from "tweetnacl-util";
import {
  TonWebTransaction,
  TonWebTransactionInMessage,
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

const decryptMessageV1 = (cell: Cell, sharedKey: Uint8Array) => {
  const slice = cell.beginParse();
  const buffer = slice.loadBuffer(slice.remainingBits / 8);
  if (buffer.length <= nacl.box.nonceLength) {
    return undefined;
  }

  const nonce = buffer.slice(0, nacl.box.nonceLength);
  const message = buffer.slice(nacl.box.nonceLength, buffer.length);

  console.log({ buffer, nonce, message });

  const decrypted = nacl.box.open.after(
    new Uint8Array(message),
    new Uint8Array(nonce),
    sharedKey
  );

  return decrypted ? encodeBase64(decrypted) : undefined;
};

const decryptMessage = (text: string, sharedKey: Uint8Array) => {
  const buffer = Buffer.from(text, "base64");

  if (buffer.length <= nacl.box.nonceLength) {
    return undefined;
  }

  const nonce = buffer.slice(0, nacl.box.nonceLength);
  const message = buffer.slice(nacl.box.nonceLength, buffer.length);

  const decrypted = nacl.box.open.after(
    new Uint8Array(message),
    new Uint8Array(nonce),
    sharedKey
  );

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

  if (outMessage.msg_data["@type"] === "msg.dataEncryptedText") {
    return {
      ...outMessage,
      msg_data: {
        ...outMessage.msg_data,
        openmask_decrypted_payload: decryptMessage(
          outMessage.msg_data.text,
          sharedKey
        ),
      },
    };
  }
  if (outMessage.msg_data["@type"] === "msg.dataRaw") {
    return {
      ...outMessage,
      msg_data: {
        ...outMessage.msg_data,
        openmask_decrypted_payload: decryptMessageV1(
          Cell.fromBase64(outMessage.msg_data.body),
          sharedKey
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
  if (!inMessage.source || inMessage.msg_data["@type"] === "msg.dataText") {
    return inMessage;
  }

  const senderPublicKey = await getWalletPublicKey(client, inMessage.source);
  const sharedKey = await getSharedSecret(
    Buffer.from(keyPair.secretKey.slice(0, 32)).toString("hex"),
    senderPublicKey
  );

  if (inMessage.msg_data["@type"] === "msg.dataEncryptedText") {
    return {
      ...inMessage,
      msg_data: {
        ...inMessage.msg_data,
        openmask_decrypted_payload: decryptMessage(
          inMessage.msg_data.text,
          sharedKey
        ),
      },
    };
  }
  if (inMessage.msg_data["@type"] === "msg.dataRaw") {
    return {
      ...inMessage,
      msg_data: {
        ...inMessage.msg_data,
        openmask_decrypted_payload: decryptMessageV1(
          Cell.fromBase64(inMessage.msg_data.body),
          sharedKey
        ),
      },
    };
  }

  return inMessage;
};

const tryToDecrypt = async (
  client: TonClient,
  keyPair: KeyPair,
  transaction: TonWebTransaction
): Promise<TonWebTransaction> => {
  const tx = Cell.fromBase64(transaction.data);

  // console.log(tx.toString());

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
