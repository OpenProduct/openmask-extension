/**
 * Service methods to manage asset state for application
 * The file should contain pure function to mutate state
 *
 * @author: KuznetsovNikita
 * @since: 0.8.0
 */

import { NftData } from "@openmask/web-sdk/build/contract/token/nft/nftContractDao";
import { AccountState } from "../entries/account";
import {
  Asset,
  JettonAsset,
  JettonState,
  NftAsset,
  NftCollectionState,
  NftItem,
  NftItemState,
} from "../entries/asset";

export interface JettonWalletData {
  balance: string;
  address: string;
}

export interface AddJettonProps {
  minter: string;
  jettonState: JettonState;
  jettonWallet: JettonWalletData | null;
}

export const seeIfJettonAsset = (asset: Asset): asset is JettonAsset => {
  return "minterAddress" in asset;
};

const useActiveAssets = (
  account: AccountState,
  map: (assets: Asset[]) => Asset[]
): AccountState => {
  return {
    ...account,
    wallets: account.wallets.map((wallet) => {
      if (wallet.address === account.activeWallet) {
        return { ...wallet, assets: map(wallet.assets ?? []) };
      }
      return wallet;
    }),
  };
};

export const addJettonToWallet = (
  account: AccountState,
  { minter, jettonState, jettonWallet }: AddJettonProps
): AccountState => {
  return useActiveAssets(account, (assets) => {
    if (
      !assets.some(
        (item) => seeIfJettonAsset(item) && item.minterAddress === minter
      )
    ) {
      // If not exists
      const asset: JettonAsset = {
        state: jettonState,
        minterAddress: minter,
        walletAddress: jettonWallet?.address,
      };
      return assets.concat([asset]);
    }
    return assets;
  });
};

export const setIfNftAssetOver = (collectionAddress: string) => {
  return (value: Asset): value is NftAsset => {
    return (
      !seeIfJettonAsset(value) && value.collectionAddress === collectionAddress
    );
  };
};

export interface AddNftProps {
  nftAddress: string;
  nftData: NftData;
  state: NftItemState | null;
  collection: NftCollectionState | null;
}

export const addNftToWallet = (
  account: AccountState,
  { nftAddress, nftData, state, collection }: AddNftProps
): AccountState => {
  const nftItemState: NftItem = {
    state: state,
    contentUri: nftData.contentUri,
    address: nftAddress,
  };
  const collectionAddress = nftData.collectionAddress
    ? nftData.collectionAddress.toString(true, true, true)
    : nftAddress;

  return useActiveAssets(account, (assets) => {
    const collectionAsset = assets.find<NftAsset>(
      setIfNftAssetOver(collectionAddress)
    );

    if (collectionAsset && !seeIfJettonAsset(collectionAsset)) {
      if (!collectionAsset.items.some((item) => item.address === nftAddress)) {
        // If not exists
        collectionAsset.items.push(nftItemState);
      }
    } else {
      const asset: NftAsset = {
        collectionAddress,
        state: collection,
        items: [nftItemState],
      };

      assets.push(asset);
    }
    return assets;
  });
};

export interface DeleteNftProps {
  collectionAddress: string;
  address: string;
}

export const deleteNftAsset = (
  account: AccountState,
  { collectionAddress, address }: DeleteNftProps
): AccountState => {
  return useActiveAssets(account, (assets) => {
    const collectionAsset = assets.find<NftAsset>(
      setIfNftAssetOver(collectionAddress)
    );
    if (!collectionAsset) {
      return assets;
    }

    if (collectionAsset.items.length === 1) {
      return assets.filter((item) => item != collectionAsset);
    } else {
      return assets.map((asset) => {
        if (asset !== collectionAsset) {
          return asset;
        } else {
          return {
            ...asset,
            items: asset.items.filter((nft) => nft.address !== address),
          };
        }
      });
    }
  });
};
