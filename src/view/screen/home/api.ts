import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext, useMemo } from "react";
import { selectNetworkConfig } from "../../../libs/entries/network";
import { DexStocks } from "../../../libs/entries/stock";
import {
  getCachedDeDustStock,
  getCachedStonFiStock,
} from "../../../libs/service/dexService";
import { QueryType } from "../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  NetworksContext,
  TonProviderContext,
} from "../../context";
import { saveAccountState } from "../api";

export const useSelectWalletMutation = () => {
  const account = useContext(AccountStateContext);
  const network = useContext(NetworkContext);
  const client = useQueryClient();
  return useMutation<void, Error, string>(async (address) => {
    const value = {
      ...account,
      activeWallet: address,
    };
    await saveAccountState(network, client, value);
  });
};

export const useBalance = (address: string) => {
  const network = useContext(NetworkContext);
  const ton = useContext(TonProviderContext);

  return useQuery<string>([network, address, QueryType.balance], async () =>
    ton.getBalance(address)
  );
};

const tonId = "the-open-network";
const currency = "usd";

export const useCoinPrice = (enabled: boolean) => {
  return useQuery<number>(
    [QueryType.price],
    async () => {
      const result = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tonId}&vs_currencies=${currency}`
      );

      const data = await result.json();
      return data[tonId][currency];
    },
    { enabled }
  );
};

export const useDexStock = (enabled: boolean) => {
  return useQuery<DexStocks>(
    [QueryType.stock],
    async () => {
      const dedust = await getCachedDeDustStock();
      const ston = await getCachedStonFiStock();
      return { dedust, ston };
    },
    { enabled }
  );
};

export const useSelectedNetworkConfig = () => {
  const network = useContext(NetworkContext);
  const networks = useContext(NetworksContext);
  return useMemo(() => {
    return selectNetworkConfig(network, networks);
  }, [network, networks]);
};
