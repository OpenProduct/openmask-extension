import { NftData } from "@openmask/web-sdk/build/contract/token/nft/nftContractDao";
import { AccountState } from "../../entries/account";
import {
  Asset,
  JettonAsset,
  JettonState,
  NftAsset,
  NftCollectionState,
  NftItem,
  NftItemState,
} from "../../entries/asset";

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

export const addJettonToWallet = (
  account: AccountState,
  { minter, jettonState, jettonWallet }: AddJettonProps
): AccountState => {
  return {
    ...account,
    wallets: account.wallets.map((wallet) => {
      if (wallet.address === account.activeWallet) {
        const assets = wallet.assets ?? [];
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
          assets.push(asset);
          return { ...wallet, assets };
        }
      }
      return wallet;
    }),
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

  return {
    ...account,
    wallets: account.wallets.map((wallet) => {
      if (wallet.address === account.activeWallet) {
        const assets = wallet.assets ?? [];

        const collectionAsset = assets.find(
          (item) =>
            !seeIfJettonAsset(item) &&
            item.collectionAddress === collectionAddress
        );

        if (collectionAsset && !seeIfJettonAsset(collectionAsset)) {
          if (
            !collectionAsset.items.some((item) => item.address === nftAddress)
          ) {
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
        return { ...wallet, assets };
      }
      return wallet;
    }),
  };
};
