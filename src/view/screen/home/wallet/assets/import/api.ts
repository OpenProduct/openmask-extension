import {
  Address,
  fromNano,
  JettonData,
  JettonMinterDao,
  JettonWalletDao,
} from "@openmask/web-sdk";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { JettonName } from "../../../../../../libs/entries/asset";
import { TonProviderContext, WalletStateContext } from "../../../../../context";

export const useJettonMinterMutation = () => {
  const provider = useContext(TonProviderContext);
  return useMutation<JettonData, Error, string>(
    async (jettonMinterAddress: string) => {
      const dap = new JettonMinterDao(
        provider,
        new Address(jettonMinterAddress)
      );

      return await dap.getJettonData();
    }
  );
};

export const useJettonNameMutation = () => {
  return useMutation<JettonName, Error, string | null>(async (jsonDataUrl) => {
    let state: Partial<JettonName> = {};
    if (jsonDataUrl) {
      try {
        state = await fetch(jsonDataUrl).then((response) => response.json());
      } catch (e) {
        throw new Error(`Failed to load Jetton Data from "${jsonDataUrl}"`);
      }
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

    return state as JettonName;
  });
};

export interface JettonWalletData {
  balance: string;
  address: string;
}
export const useJettonWalletMutation = () => {
  const provider = useContext(TonProviderContext);
  const wallet = useContext(WalletStateContext);

  return useMutation<JettonWalletData, Error, string>(
    async (jettonMinterAddress) => {
      const minter = new JettonMinterDao(
        provider,
        new Address(jettonMinterAddress)
      );

      const jettonWalletAddress = await minter.getJettonWalletAddress(
        new Address(wallet.address)
      );
      if (!jettonWalletAddress) {
        throw new Error("Missing jetton wallet address.");
      }

      const dao = new JettonWalletDao(provider, jettonWalletAddress);
      const data = await dao.getData();
      return {
        balance: fromNano(data.balance),
        address: jettonWalletAddress.toString(true, true, true),
      };
    }
  );
};
