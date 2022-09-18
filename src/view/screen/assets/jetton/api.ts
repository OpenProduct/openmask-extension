import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { JettonState } from "../../../../libs/entries/asset";
import { TonWebTransaction } from "../../../../libs/entries/transaction";
import { QueryType } from "../../../../libs/store/browserStore";
import { NetworkContext, TonProviderContext } from "../../../context";

export const useJettonTransactions = (
  state: JettonState,
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
