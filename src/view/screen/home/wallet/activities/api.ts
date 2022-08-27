import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { QueryType } from "../../../../../libs/browserStore";
import { TonWebTransaction } from "../../../../../libs/entries/transaction";
import {
  NetworkContext,
  TonProviderContext,
  WalletStateContext,
} from "../../../../context";

export const useTransactions = (limit: number = 10) => {
  const network = useContext(NetworkContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);

  return useQuery<TonWebTransaction[], Error>(
    [network, wallet.address, QueryType.transactions],
    () => ton.getTransactions(wallet.address, limit)
  );
};
