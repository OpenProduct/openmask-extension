import { Address, fromNano } from "@openmask/web-sdk";
import {
  JettonData,
  JettonMinterDao,
} from "@openmask/web-sdk/build/contract/token/ft/jettonMinterDao";
import { JettonWalletDao } from "@openmask/web-sdk/build/contract/token/ft/jettonWalletDao";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { JettonName, JettonState } from "../../../../libs/entries/asset";
import { QueryType } from "../../../../libs/store/browserStore";
import { TonProviderContext, WalletStateContext } from "../../../context";

const getJettonName = async (
  jsonDataUrl: string | null,
  searchParams: URLSearchParams
) => {
  let state: Partial<JettonName> = {};
  if (jsonDataUrl) {
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
  if (!state.image) {
    errors.push("image");
  }
  if (errors.length) {
    throw new Error(`Failed to load ${errors.join(", ")} Jetton Data`);
  }

  return state as JettonName;
};

export interface JettonMinterData {
  data: JettonData;
  state: JettonName;
  jettonWalletAddress: Address | null;
}

export const useJettonMinterData = (
  jettonMinterAddress: string,
  searchParams: URLSearchParams
) => {
  const provider = useContext(TonProviderContext);
  const wallet = useContext(WalletStateContext);
  return useQuery<JettonMinterData, Error>(
    [QueryType.jetton, jettonMinterAddress],
    async () => {
      const dap = new JettonMinterDao(
        provider,
        new Address(jettonMinterAddress)
      );

      const data = await dap.getJettonData();

      const state = await getJettonName(data.jettonContentUri, searchParams);

      const jettonWalletAddress = await dap
        .getJettonWalletAddress(new Address(wallet.address))
        .catch(() => null);

      return { data, state, jettonWalletAddress };
    },
    { enabled: !!jettonMinterAddress }
  );
};

export const useJettonWalletData = (
  id: number,
  jettonWalletAddress?: Address | null
) => {
  const provider = useContext(TonProviderContext);

  return useQuery(
    [QueryType.jetton, jettonWalletAddress, id],
    async () => {
      const dap = new JettonWalletDao(provider, jettonWalletAddress!);
      const data = await dap.getData();
      return fromNano(data.balance);
    },
    { enabled: !!jettonWalletAddress }
  );
};

export interface AddJettonParams {
  state: JettonState;
  origin: string;
}

export const useAddJettonMutation = () => {
  return useMutation<void, Error, AddJettonParams>(
    async ({ state, origin }) => {
      throw new Error("Error on insert jetton.");
    }
  );
};
