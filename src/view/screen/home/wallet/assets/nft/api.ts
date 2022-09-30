import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { NftItem } from "../../../../../../libs/entries/asset";
import { TonWebTransaction } from "../../../../../../libs/entries/transaction";
import {
  deleteNftAsset,
  DeleteNftProps,
} from "../../../../../../libs/state/assetService";
import { QueryType } from "../../../../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
} from "../../../../../context";
import { saveAccountState } from "../../../../api";

export const useNFtTransactions = (state: NftItem, limit: number = 10) => {
  const network = useContext(NetworkContext);
  const ton = useContext(TonProviderContext);

  return useQuery<TonWebTransaction[], Error>(
    [network, state.address, QueryType.transactions],
    () => ton.getTransactions(state.address, limit)
  );
};

export const useHideNftMutation = () => {
  const network = useContext(NetworkContext);
  const account = useContext(AccountStateContext);
  const client = useQueryClient();

  return useMutation<void, Error, DeleteNftProps>(async (options) => {
    const value = deleteNftAsset(account, options);
    await saveAccountState(network, client, value);
  });
};
