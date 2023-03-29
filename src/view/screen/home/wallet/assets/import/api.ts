import {
  Address,
  Cell,
  NftCollectionDao,
  NftContentDao,
  NftData,
} from "@openproduct/web-sdk";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { Cell as CoreCell } from "ton-core";
import {
  DomainNftState,
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
} from "../../../../../../libs/state/assetService";
import {
  getJettonFullData,
  JettonFullData,
} from "../../../../../../libs/state/jettonService";
import { readOnchainMetadata } from "../../../../../../libs/state/onchainContent";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
  WalletStateContext,
} from "../../../../../context";
import { saveAccountState } from "../../../../api";

export const useJettonFullData = () => {
  const client = useContext(TonProviderContext);
  const wallet = useContext(WalletStateContext);
  return useMutation<JettonFullData, Error, string>(
    (jettonMinterAddress: string) => {
      return getJettonFullData(client, wallet.address, jettonMinterAddress);
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
  return useMutation<NftItemState, Error, NftData>(
    async ({ contentUri, contentCell }) => {
      if (contentUri) {
        const state = await requestJson<NftItemState>(contentUri);
        return await NftItemStateSchema.validateAsync(state);
      } else {
        const state = readOnchainMetadata(
          CoreCell.fromBase64(contentCell.toBase64()),
          ["image", "name", "description"]
        );
        return await NftItemStateSchema.validateAsync(state);
      }
    }
  );
};

export const useNftCollectionDataMutation = () => {
  const provider = useContext(TonProviderContext);
  return useMutation<NftCollectionState, Error, Address>(async (address) => {
    const dao = new NftCollectionDao(provider, address);
    const data = await dao.getCollectionData();

    if (data.collectionContentUri) {
      const state = await requestJson<NftCollectionState>(
        data.collectionContentUri
      );
      return await NftCollectionStateSchema.validateAsync(state);
    } else if (data.collectionContentCell) {
      const state = readOnchainMetadata<NftCollectionState>(
        CoreCell.fromBase64(data.collectionContentCell.toBase64()),
        ["image", "name", "description"]
      );
      return await NftCollectionStateSchema.validateAsync(state);
    }
    throw new Error("Missing collection content");
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
