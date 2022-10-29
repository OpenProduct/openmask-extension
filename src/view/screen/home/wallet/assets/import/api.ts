import {
  Address,
  Cell,
  fromNano,
  JettonData,
  JettonMinterDao,
  JettonWalletDao,
  NftCollectionDao,
  NftData,
} from "@openproduct/web-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import {
  DomainNftState,
  JettonState,
  JettonStateSchema,
  NftCollectionState,
  NftCollectionStateSchema,
  NftItemState,
} from "../../../../../../libs/entries/asset";
import {
  getNftData,
  getNftItemState,
} from "../../../../../../libs/service/nftService";
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
  return useMutation<NftData, Error, string>((nftAddress) =>
    getNftData(provider, nftAddress)
  );
};

export const useNftContentMutation = () => {
  return useMutation<NftItemState, Error, string>(getNftItemState);
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

interface DomainNftProps {
  collection: NftCollectionState;
  address: string;
}
export const useDomainNftMutation = () => {
  const provider = useContext(TonProviderContext);

  return useMutation<NftItemState | undefined, Error, DomainNftProps>(
    async ({ collection, address }) => {
      if (collection.name === "TON DNS Domains") {
        /**
         * https://github.com/ton-blockchain/dns-contract/blob/8864d3f6e1743910dc6ec6708540806283df09c4/func/nft-item.fc#L280
         */
        const result: Cell = await provider.call2(address, "get_domain");

        const nft: DomainNftState = {
          name: collection.name,
          root: "ton",
          domain: Buffer.from(result.bits.array).toString(),
        };
        return nft;
      }

      return undefined;
    }
  );
};
