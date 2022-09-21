import { Address, fromNano } from "@openmask/web-sdk";
import {
  JettonData,
  JettonMinterDao
} from "@openmask/web-sdk/build/contract/token/ft/jettonMinterDao";
import { JettonWalletDao } from "@openmask/web-sdk/build/contract/token/ft/jettonWalletDao";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { JettonAsset, JettonState } from "../../../../libs/entries/asset";
import { QueryType } from "../../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext
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

const getJettonName = async (
  jsonDataUrl: string | null,
  searchParams: URLSearchParams
) => {
  let state: Partial<JettonState> = {};
  if (jsonDataUrl) {
    if (jsonDataUrl.startsWith("ipfs://")) {
      jsonDataUrl = jsonDataUrl.replace("ipfs://", "https://ipfs.io/ipfs/");
    }
    try {
      state = await fetch(jsonDataUrl).then((response) => response.json());
    } catch (e) {
      throw new Error(`Failed to load Jetton Data from "${jsonDataUrl}"`);
    }
  } else {
    state = {
      symbol: decodeURIComponent(searchParams.get("symbol") ?? ""),
      image: decodeURIComponent(searchParams.get("image") ?? ""),
      name: decodeURIComponent(searchParams.get("name") ?? ""),
    };
  }

  const errors: string[] = [];
  if (!state.name) {
    errors.push("name");
  }
  if (!state.symbol) {
    errors.push("symbol");
  }
  if (errors.length) {
    throw new Error(`Failed to load ${errors.join(", ")} Jetton Data`);
  }

  return state as JettonState;
};

export interface JettonMinterData {
  data: JettonData;
  state: JettonState;
}

export const useJettonMinterData = (
  jettonMinterAddress: string,
  searchParams: URLSearchParams
) => {
  const provider = useContext(TonProviderContext);
  return useQuery<JettonMinterData, Error>(
    [QueryType.jetton, jettonMinterAddress],
    async () => {
      const dap = new JettonMinterDao(
        provider,
        new Address(jettonMinterAddress)
      );

      const data = await dap.getJettonData();

      const state = await getJettonName(data.jettonContentUri, searchParams);

      return { data, state };
    },
    { enabled: !!jettonMinterAddress }
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

      const jettonWalletAddress = await minter.getJettonWalletAddress(
        new Address(walletAddress)
      );
      if (!jettonWalletAddress) {
        throw new Error("Missing jetton wallet address.");
      }

      const dao = new JettonWalletDao(provider, jettonWalletAddress);
      const data = await dao.getData();
      return fromNano(data.balance);
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
              !assets.some((item) => item.minterAddress === state.minterAddress)
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
