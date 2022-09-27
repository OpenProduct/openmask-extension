import Joi from "joi";

export interface JettonParams {
  type: "jetton";
  // The address of the token contract
  address: string;
  // A ticker symbol or shorthand, up to 11 characters
  symbol?: string;
  // A string url of the token logo
  image?: string;
  // A jetton name
  name?: string;
}

export interface JettonState {
  symbol: string;
  name: string;
  image?: string;
  description?: string;
}

export const JettonStateSchema = Joi.object<JettonState>({
  name: Joi.string().required(),
  symbol: Joi.string().required(),
  description: Joi.string(),
  image: Joi.string(),
}).unknown();

export interface JettonAsset {
  state: JettonState;
  minterAddress: string;
  walletAddress?: string;
}

export interface NftState {
  image: string;
  name?: string;
  description?: string;
}

export const NftStateSchema = Joi.object<NftState>({
  image: Joi.string().required(),
  name: Joi.string(),
  description: Joi.string(),
}).unknown();

export interface NftItem {
  state?: NftState;
  contentUri: string | null;
  address: string;
}

export interface NftAsset {
  items: NftItem[];
  collectionAddress: string;
}

export type Asset = JettonAsset | NftAsset;
