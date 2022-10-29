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

export interface TonWebTransactionId {
  "@type": "internal.transactionId";
  lt: string;
  hash: string;
}

export type TonWebTransactionMessage =
  | TonWebTransactionInMessage
  | TonWebTransactionOutMessage;

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

export type TonWebTransactionMessageData =
  | TonWebTransactionMessageRaw
  | TonWebTransactionMessageText;

export interface TonWebTransactionMessageRaw {
  "@type": "msg.dataRaw";
  body: string;
  init_state: string;
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
