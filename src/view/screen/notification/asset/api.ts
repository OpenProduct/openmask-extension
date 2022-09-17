import { Address } from "@openmask/web-sdk";
import { JettonMinterDao } from "@openmask/web-sdk/build/contract/token/ft/jettonMinterDao";
import { JettonWalletDao } from "@openmask/web-sdk/build/contract/token/ft/jettonWalletDao";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { QueryType } from "../../../../libs/store/browserStore";
import { TonProviderContext, WalletAddressContext } from "../../../context";

export interface JettonState {
  symbol: string;
  image: string;
  name: string;
}

const getJettonState = async (
  jsonDataUrl: string | null,
  searchParams: URLSearchParams
) => {
  let state: Partial<JettonState> = {};
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

  return state as JettonState;
};

export const useJettonMinterData = (
  jettonMinterAddress: string,
  searchParams: URLSearchParams
) => {
  const provider = useContext(TonProviderContext);
  const address = useContext(WalletAddressContext);
  return useQuery(
    [QueryType.jetton, jettonMinterAddress],
    async () => {
      const dap = new JettonMinterDao(
        provider,
        new Address(jettonMinterAddress)
      );

      const data = await dap.getJettonData();

      const state = await getJettonState(data.jettonContentUri, searchParams);

      console.log(address);
      //   const jettonWalletAddress = await dap
      //     .getJettonWalletAddress(new Address(address))
      //     .catch(() => null);

      return { data, state };
    },
    { enabled: !!jettonMinterAddress }
  );
};

export const useJettonWalletData = (
  id: number,
  jettonWalletAddress: string
) => {
  const provider = useContext(TonProviderContext);

  return useQuery(
    [QueryType.jetton, jettonWalletAddress, id],
    async () => {
      const dap = new JettonWalletDao(
        provider,
        new Address(jettonWalletAddress)
      );

      const data = await dap.getData();

      return data;
    },
    { enabled: !!jettonWalletAddress }
  );
};
