import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { QueryType } from ".";
import {
  NetworkContext,
  TonProviderContext,
  WalletStateContext,
} from "../../context";

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

export interface TonWebTransactionMessageData {
  "@type": "msg.dataRaw";
  body: string;
  init_state: string;
}

export const useTransactions = (limit: number = 10) => {
  const network = useContext(NetworkContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);

  return useQuery<TonWebTransaction[], Error>(
    [network, wallet.address, QueryType.transactions],
    () => ton.getTransactions(wallet.address, limit)
  );
};
