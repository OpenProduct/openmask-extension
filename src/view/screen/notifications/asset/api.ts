import { Address, JettonData, JettonMinterDao } from "@openproduct/web-sdk";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import {
  JettonAsset,
  JettonParams,
  JettonState,
  JettonStateSchema,
} from "../../../../libs/entries/asset";
import { seeIfJettonAsset } from "../../../../libs/state/assetService";
import {
  getJettonNameState,
  getJettonWalletData,
} from "../../../../libs/state/jettonService";
import { QueryType } from "../../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
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

const getJettonName = async (data: JettonData, params: JettonParams) => {
  try {
    return await getJettonNameState(data);
  } catch (e) {
    const state = {
      symbol: params.symbol,
      image: params.image,
      name: params.name,
      decimals: params.decimals,
    };
    return await JettonStateSchema.validateAsync(state);
  }
};

export interface JettonMinterData {
  data: JettonData;
  state: JettonState;
}

export const useJettonMinterData = (params: JettonParams) => {
  const provider = useContext(TonProviderContext);
  return useQuery<JettonMinterData, Error>(
    [QueryType.jetton, params.address],
    async () => {
      const dao = new JettonMinterDao(provider, new Address(params.address));

      const data = await dao.getJettonData();

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
  const provider = useContext(TonProviderContext);
  return useQuery(
    [QueryType.jetton, jettonMinterAddress, walletAddress, id],
    async () => {
      const minter = new JettonMinterDao(
        provider,
        new Address(jettonMinterAddress)
      );

      return getJettonWalletData(provider, minter, walletAddress);
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
            const assets = wallet.assets ?? [];
            if (
              !assets.some(
                (item) =>
                  seeIfJettonAsset(item) &&
                  item.minterAddress === state.minterAddress
              )
            ) {
              // If not exists
              assets.push(state);
              return { ...wallet, assets };
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
