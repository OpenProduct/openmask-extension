import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { JettonAsset } from "../../../../../../libs/entries/asset";
import { TonWebTransaction } from "../../../../../../libs/entries/transaction";
import { deleteJettonAsset } from "../../../../../../libs/state/assetService";
import { QueryType } from "../../../../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
} from "../../../../../context";
import { saveAccountState } from "../../../../api";

export const useJettonTransactions = (
  state: JettonAsset,
  limit: number = 10
) => {
  const network = useContext(NetworkContext);
  const ton = useContext(TonProviderContext);

  return useQuery<TonWebTransaction[], Error>(
    [network, state?.walletAddress, QueryType.transactions],
    () => ton.getTransactions(state?.walletAddress!, limit),
    { enabled: state?.walletAddress != null }
  );
};

export const useHideJettonMutation = () => {
  const network = useContext(NetworkContext);
  const account = useContext(AccountStateContext);
  const client = useQueryClient();
  return useMutation<void, Error, string>(
    async (jettonMinterAddress: string) => {
      const value = deleteJettonAsset(account, jettonMinterAddress);
      await saveAccountState(network, client, value);
    }
  );
};
