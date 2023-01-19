import { Replace } from "./common";

export interface TonWebTransaction {
  "@type": "raw.transaction";
  data: string;
  fee: string;
  other_fee: string;
  storage_fee: string;
  transaction_id: TonWebTransactionId;
  out_msgs: TonWebTransactionOutMessage[];
  utime: number;
  in_msg: TonWebTransactionInMessage;
}

export type TonWebTransactionWithDecryptedPayload = Replace<Replace<TonWebTransaction, "in_msg", TonWebTransactionInMessageWithDecryptedPayload>, "out_msgs", TonWebTransactionOutMessageWithDecryptedPayload[]>

export interface TonWebTransactionId {
  "@type": "internal.transactionId";
  lt: string;
  hash: string;
}

export type TonWebTransactionMessage =
  | TonWebTransactionInMessage
  | TonWebTransactionOutMessage;

export type TonWebTransactionMessageWithDecryptedPayload =
  | TonWebTransactionInMessageWithDecryptedPayload
  | TonWebTransactionOutMessageWithDecryptedPayload;

export interface TonWebTransactionInMessage {
  "@type": "raw.message";
  body_hash: string;
  created_lt: string;
  source: string;
  destination: string;
  value: string;
  fwd_fee: string;
  ihr_fee: string;
  message: string;
  msg_data: TonWebTransactionMessageData;
}

export type TonWebTransactionInMessageWithDecryptedPayload = Replace<TonWebTransactionInMessage, "msg_data", TonWebTransactionMessageDataWithDecryptedPayload>

export interface TonWebTransactionOutMessage {
  "@type": "raw.message";
  body_hash: string;
  created_lt: string;
  destination: string;
  fwd_fee: string;
  ihr_fee: string;
  message: string;
  msg_data: TonWebTransactionMessageData;
  source: string;
  value: string;
}

export type TonWebTransactionOutMessageWithDecryptedPayload = Replace<TonWebTransactionOutMessage, "msg_data", TonWebTransactionMessageDataWithDecryptedPayload>

export type TonWebTransactionMessageData =
  | TonWebTransactionMessageRaw
  | TonWebTransactionMessageText;

export type TonWebTransactionMessageDataWithDecryptedPayload =
  | TonWebTransactionDecryptedMessageRaw
  | TonWebTransactionMessageText;


export interface TonWebTransactionMessageRaw {
  "@type": "msg.dataRaw";
  body: string;
  init_state: string;
}

export interface TonWebTransactionDecryptedMessageRaw extends TonWebTransactionMessageRaw {
  decrypted_payload? :string;
}

export interface TonWebTransactionMessageText {
  "@type": "msg.dataText";
  text: string;
}

export interface TransactionParams {
  value: string;
  to: string;
  dataType?: "hex" | "base64" | "boc";
  data?: string;
}
