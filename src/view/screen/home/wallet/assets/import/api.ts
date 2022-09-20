import {
  Address,
  fromNano,
  JettonData,
  JettonMinterDao,
  JettonWalletDao,
} from "@openmask/web-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { JettonAsset, JettonState } from "../../../../../../libs/entries/asset";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
  WalletStateContext,
} from "../../../../../context";
import { saveAccountState } from "../../../../api";

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
  return useMutation<JettonState, Error, string | null>(async (jsonDataUrl) => {
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

interface AddJettonProps {
  minter: string;
  jettonState: JettonState;
  jettonWallet: JettonWalletData | null;
}

export const useAddJettonMutation = () => {
  const network = useContext(NetworkContext);
  const account = useContext(AccountStateContext);
  const client = useQueryClient();

  return useMutation<void, Error, AddJettonProps>(
    async ({ jettonState, minter, jettonWallet }) => {
      const value = {
        ...account,
        wallets: account.wallets.map((wallet) => {
          if (wallet.address === account.activeWallet) {
            const assets = wallet.assets ?? [];
            if (!assets.some((item) => item.minterAddress === minter)) {
              // If not exists
              const asset: JettonAsset = {
                state: jettonState,
                minterAddress: minter,
                walletAddress: jettonWallet?.address,
              };
              assets.push(asset);
              return { ...wallet, assets };
            }
          }
          return wallet;
        }),
      };
      await saveAccountState(network, client, value);
    }
  );
};
