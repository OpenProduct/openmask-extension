import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { Address } from "ton-core";
import {
  JettonMinter,
  JettonMinterContent,
  JettonMinterData,
} from "ton-wrappers";
import {
  JettonAsset,
  JettonParams,
  JettonStateSchema,
} from "../../../../libs/entries/asset";
import {
  getWalletAssets,
  setWalletAssets,
} from "../../../../libs/entries/wallet";
import { seeIfJettonAsset } from "../../../../libs/state/assetService";
import { getJettonFullData } from "../../../../libs/state/jettonService";
import { QueryType } from "../../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  TonClientContext,
} from "../../../context";
import { askBackground, sendBackground } from "../../../event";
import { saveAccountState } from "../../api";

export const useOriginWallets = (origin: string) => {
  return useQuery(
    [QueryType.origin, origin],
    async () => {
      const wallets = await askBackground<string[] | null>().message(
        "getWallets",
        origin
      );
      if (wallets == null) {
        throw new Error("Unexpected wallets");
      }
      return wallets;
    },
    { enabled: !!origin }
  );
};

const getJettonName = async (data: JettonMinterData, params: JettonParams) => {
  if (data.jettonContent) {
    return await JettonStateSchema.validateAsync(data.jettonContent);
  } else {
    const state = {
      symbol: params.symbol,
      image: params.image,
      name: params.name,
      decimals: params.decimals,
    };
    return await JettonStateSchema.validateAsync(state);
  }
};

export interface JettonMinterState {
  data: JettonMinterData;
  state: JettonMinterContent;
}

export const useJettonMinterData = (params: JettonParams) => {
  const client = useContext(TonClientContext);
  return useQuery<JettonMinterState, Error>(
    [QueryType.jetton, params.address],
    async () => {
      const minter = client.open(
        JettonMinter.createFromAddress(Address.parse(params.address))
      );

      const data = await minter.getJettonData();

      const state = await getJettonName(data, params);

      return { data, state };
    }
  );
};

export const useJettonWalletBalance = (
  id: number,
  jettonMinterAddress: string,
  walletAddress: string
) => {
  const client = useContext(TonClientContext);
  return useQuery(
    [QueryType.jetton, jettonMinterAddress, walletAddress, id],
    async () => {
      const { wallet } = await getJettonFullData(
        client,
        walletAddress,
        jettonMinterAddress
      );
      return wallet;
    }
  );
};

export interface AddJettonParams {
  state: JettonAsset;
  wallets: string[] | undefined;
}

export const useAddJettonMutation = (id: number) => {
  const network = useContext(NetworkContext);
  const account = useContext(AccountStateContext);
  const client = useQueryClient();

  return useMutation<void, Error, AddJettonParams>(
    async ({ state, wallets }) => {
      if (!wallets) {
        throw new Error("Unexpected set of wallets");
      }
      const value = {
        ...account,
        wallets: account.wallets.map((wallet) => {
          if (wallets.includes(wallet.address)) {
            const assets = getWalletAssets(wallet);
            if (
              !assets.some(
                (item) =>
                  seeIfJettonAsset(item) &&
                  item.minterAddress === state.minterAddress
              )
            ) {
              // If not exists
              assets.push(state);
              return setWalletAssets(wallet, assets);
            }
          }
          return wallet;
        }),
      };
      await saveAccountState(network, client, value);
      sendBackground.message("approveRequest", { id, payload: undefined });
    }
  );
};
