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
  JettonData,
  JettonMinter,
  JettonMinterData,
} from "../wrappers/JettonMinter";
import { JettonWallet } from "../wrappers/JettonWallet";
import { JettonWalletData } from "./assetService";
import { formatAmountValue } from "./decimalsService";

export interface JettonFullData {
  data: JettonData;
  wallet: JettonWalletData | null;
  name: JettonMinterData | null;
}

export const getJettonFullData = async (
  client: TonClient,
  walletAddress: string,
  jettonMinterAddress: string
): Promise<JettonFullData> => {
  const minterAddress = Address.parse(jettonMinterAddress);

  const minter = client.open(JettonMinter.createFromAddress(minterAddress));

  const data = await minter.getJettonData();

  const name = data.jettonContent;

  const jettonWalletAddress = await minter.getJettonWalletAddress(
    Address.parse(walletAddress)
  );

  const wallet = await getJettonWalletData(
    client,
    jettonWalletAddress,
    minterAddress,
    data.jettonContent
  ).catch((e) => null);

  return { data, wallet, name };
};

export const getJettonWalletData = async (
  client: TonClient,
  jettonWalletAddress: Address,
  jettonMinterAddress: Address,
  jetton?: Partial<JettonMinterData> | null
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

  const decimals = parseInt(jetton?.decimals ?? "9");

  return {
    balance: formatAmountValue(data.balance.toString(), decimals),
    address: jettonWalletAddress.toString(),
  };
};
