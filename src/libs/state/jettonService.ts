/**
 * Service methods to download jetton data
 * The file should contain pure function to download state via http provider
 *
 * @author: KuznetsovNikita
 * @since: 0.12.0
 */

import {
  Address,
  fromNano,
  JettonData,
  JettonMinterDao,
  JettonWalletDao,
  TonHttpProvider,
} from "@openproduct/web-sdk";
import { JettonState, JettonStateSchema } from "../entries/asset";
import { Logger } from "../logger";
import { requestJson } from "../service/requestService";
import { JettonWalletData } from "./assetService";

export interface JettonFullData {
  data: JettonData;
  wallet: JettonWalletData | null;
  name: JettonState | null;
}

export const getJettonFullData = async (
  provider: TonHttpProvider,
  walletAddress: string,
  jettonMinterAddress: string
): Promise<JettonFullData> => {
  const minter = new JettonMinterDao(
    provider,
    new Address(jettonMinterAddress)
  );

  const data = await minter.getJettonData();

  const [wallet, name] = await Promise.all([
    getJettonWalletData(provider, minter, walletAddress).catch((e) => {
      Logger.log(e);
      return null;
    }),
    getJettonNameState(data).catch((e) => {
      Logger.log(e);
      return null;
    }),
  ] as const);

  return { data, wallet, name };
};

export const getJettonWalletData = async (
  provider: TonHttpProvider,
  minter: JettonMinterDao,
  walletAddress: string
): Promise<JettonWalletData> => {
  const jettonWalletAddress = await minter.getJettonWalletAddress(
    new Address(walletAddress)
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
};

export const getJettonNameState = async (data: JettonData) => {
  let state: Partial<JettonState> = {};
  const { jettonContentUri, jettonContent } = data;

  if (jettonContentUri) {
    state = await requestJson<Partial<JettonState>>(jettonContentUri);
  } else if (jettonContent) {
    state = jettonContent;
  }
  return await JettonStateSchema.validateAsync(state);
};
