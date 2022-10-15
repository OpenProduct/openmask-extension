import {
  Address,
  fromNano,
  JettonData,
  JettonMinterDao,
  JettonWalletDao,
  NftCollectionDao,
  NftContentDao,
  NftData,
} from "@openproduct/web-sdk/build/cjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import {
  JettonState,
  JettonStateSchema,
  NftCollectionState,
  NftCollectionStateSchema,
  NftItemState,
  NftItemStateSchema,
} from "../../../../../../libs/entries/asset";
import { requestJson } from "../../../../../../libs/service/requestService";
import {
  AddJettonProps,
  addJettonToWallet,
  AddNftProps,
  addNftToWallet,
  JettonWalletData,
} from "../../../../../../libs/state/assetService";
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
      state = await requestJson<Partial<JettonState>>(jsonDataUrl);
    }

    return await JettonStateSchema.validateAsync(state);
  });
};

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

export const useAddJettonMutation = () => {
  const network = useContext(NetworkContext);
  const account = useContext(AccountStateContext);
  const client = useQueryClient();

  return useMutation<void, Error, AddJettonProps>(async (options) => {
    const value = addJettonToWallet(account, options);
    await saveAccountState(network, client, value);
  });
};

export const useNftDataMutation = () => {
  const provider = useContext(TonProviderContext);
  return useMutation<NftData, Error, string>(async (nftAddress) => {
    const address = new Address(nftAddress);
    const dao = new NftContentDao(provider, address);
    return await dao.getData();
  });
};

export const useNftContentMutation = () => {
  return useMutation<NftItemState, Error, string>(async (jsonUrl) => {
    const state = await requestJson<NftItemState>(jsonUrl!);
    return await NftItemStateSchema.validateAsync(state);
  });
};

export const useNftCollectionDataMutation = () => {
  const provider = useContext(TonProviderContext);
  return useMutation<NftCollectionState, Error, Address>(async (address) => {
    const dao = new NftCollectionDao(provider, address);
    const data = await dao.getCollectionData();
    if (!data.collectionContentUri) {
      throw new Error("Missing collection content");
    }
    const state = await requestJson<NftCollectionState>(
      data.collectionContentUri
    );

    return await NftCollectionStateSchema.validateAsync(state);
  });
};

export const useAddNftMutation = () => {
  const network = useContext(NetworkContext);
  const account = useContext(AccountStateContext);
  const client = useQueryClient();

  return useMutation<void, Error, AddNftProps>(async (options) => {
    const value = addNftToWallet(account, options);
    await saveAccountState(network, client, value);
  });
};
