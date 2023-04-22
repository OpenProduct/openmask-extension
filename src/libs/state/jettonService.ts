/**
 * Service methods to download jetton data
 * The file should contain pure function to download state via http provider
 *
 * @author: KuznetsovNikita
 * @since: 0.12.0
 */

import { TonClient } from "ton";
import { Address } from "ton-core";
import {
  JettonMinter,
  JettonMinterContent,
  JettonMinterData,
  JettonWallet,
} from "ton-wrappers";
import { JettonStateSchema } from "../entries/asset";
import { JettonWalletData } from "./assetService";

export interface JettonFullData {
  data: JettonMinterData;
  wallet: JettonWalletData | null;
  name: JettonMinterContent | null;
}

export const getJettonFullData = async (
  client: TonClient,
  walletAddress: string,
  jettonMinterAddress: string
): Promise<JettonFullData> => {
  const minterAddress = Address.parse(jettonMinterAddress);

  const minter = client.open(JettonMinter.createFromAddress(minterAddress));

  const data = await minter.getJettonData();

  const name = await JettonStateSchema.validateAsync(data.jettonContent);

  const jettonWalletAddress = await minter.getWalletAddress(
    Address.parse(walletAddress)
  );

  const wallet = await getJettonWalletData(
    client,
    jettonWalletAddress,
    minterAddress
  ).catch((e) => null);

  return { data, wallet, name };
};

export const getJettonWalletData = async (
  client: TonClient,
  jettonWalletAddress: Address,
  jettonMinterAddress: Address
): Promise<JettonWalletData> => {
  const jettonWallet = client.open(
    JettonWallet.createFromAddress(jettonWalletAddress)
  );

  const data = await jettonWallet.getData();

  if (!data.jettonMinterAddress) {
    throw new Error("Missing jetton minter address.");
  }
  if (
    data.jettonMinterAddress.toRawString() !== jettonMinterAddress.toRawString()
  ) {
    throw new Error("Jetton minter address not match.");
  }

  return {
    balance: data.balance.toString(),
    address: jettonWalletAddress.toString(),
  };
};
