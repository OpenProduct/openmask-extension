/**
 * Service methods to download jetton data
 * The file should contain pure function to download state via http provider
 *
 * @author: KuznetsovNikita
 * @since: 0.12.0
 */

import {
  Address,
  JettonData,
  JettonMinterDao,
  JettonWalletDao,
  TonHttpProvider,
} from "@openproduct/web-sdk";
import { JettonState, JettonStateSchema } from "../entries/asset";
import { requestJson } from "../service/requestService";
import { JettonWalletData } from "./assetService";
import { formatAmountValue } from "./decimalsService";

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

  const name = await getJettonNameState(data).catch((e) => null);

  const wallet = await getJettonWalletData(
    jettonMinterAddress,
    provider,
    minter,
    walletAddress,
    name
  ).catch((e) => null);

  return { data, wallet, name };
};

export const getJettonWalletData = async (
  jettonMinterAddress: string,
  provider: TonHttpProvider,
  minter: JettonMinterDao,
  walletAddress: string,
  jetton?: JettonState | null
): Promise<JettonWalletData> => {
  const jettonWalletAddress = await minter.getJettonWalletAddress(
    new Address(walletAddress)
  );
  if (!jettonWalletAddress) {
    throw new Error("Missing jetton wallet address.");
  }

  const dao = new JettonWalletDao(provider, jettonWalletAddress);
  const data = await dao.getData();

  if (!data.jettonMinterAddress) {
    throw new Error("Missing jetton minter address.");
  }
  if (
    data.jettonMinterAddress?.toString(false) !==
    new Address(jettonMinterAddress).toString(false)
  ) {
    throw new Error("Jetton minter address not match.");
  }

  const decimals = parseInt(jetton?.decimals ?? "9");

  return {
    balance: formatAmountValue(data.balance, decimals),
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
  if (state.name) {
    state.name = state.name.replace(/\0.*$/g, ""); // remove null bytes
  }
  if (state.decimals && typeof state.decimals == "number") {
    state.decimals = String(state.decimals);
  }

  return await JettonStateSchema.validateAsync(state);
};
