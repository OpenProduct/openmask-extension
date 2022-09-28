import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { NftItem } from "../../../../../../libs/entries/asset";
import { TonWebTransaction } from "../../../../../../libs/entries/transaction";
import { QueryType } from "../../../../../../libs/store/browserStore";
import { NetworkContext, TonProviderContext } from "../../../../../context";

export const useNFtTransactions = (state: NftItem, limit: number = 10) => {
  const network = useContext(NetworkContext);
  const ton = useContext(TonProviderContext);

  return useQuery<TonWebTransaction[], Error>(
    [network, state.address, QueryType.transactions],
    () => ton.getTransactions(state.address, limit)
  );
};

export const useHideNftMutation = () => {
  return useMutation<void, Error, string>(async (address) => {
    address;
    return;
  });
};
