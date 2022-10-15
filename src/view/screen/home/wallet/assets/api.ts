import {
  Address,
  JettonMinterDao,
  JettonWalletDao,
  TonHttpProvider,
} from "@openproduct/web-sdk/build/cjs";
import { QueryClient, useQuery, useQueryClient } from "@tanstack/react-query";
import { useContext } from "react";
import { AccountState } from "../../../../../libs/entries/account";
import { JettonAsset } from "../../../../../libs/entries/asset";
import { QueryType } from "../../../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
} from "../../../../context";
import { saveAccountState } from "../../../api";

const getJettonWalletAddress = async (
  client: QueryClient,
  network: string,
  provider: TonHttpProvider,
  jetton: JettonAsset,
  account: AccountState
): Promise<Address | null> => {
  if (jetton.walletAddress) {
    return new Address(jetton.walletAddress);
  }

  const minter = new JettonMinterDao(
    provider,
    new Address(jetton.minterAddress)
  );

  const { activeWallet } = account;
  if (!activeWallet) {
    throw new Error("Unexpected active wallet");
  }
  const jettonWalletAddress = await minter.getJettonWalletAddress(
    new Address(activeWallet)
  );

  if (jettonWalletAddress != null) {
    // Update wallet jetton address in store
    const value: AccountState = {
      ...account,
      wallets: account.wallets.map((wallet) => {
        if (wallet.address === account.activeWallet) {
          return {
            ...wallet,
            assets: wallet.assets?.map((asset) => {
              if (
                "minterAddress" in asset &&
                asset.minterAddress === jetton.minterAddress
              ) {
                return {
                  ...asset,
                  walletAddress: jettonWalletAddress.toString(true, true, true),
                };
              } else {
                return asset;
              }
            }),
          };
        } else {
          return wallet;
        }
      }),
    };
    await saveAccountState(network, client, value);
  }

  return jettonWalletAddress;
};

export const useJettonWalletBalance = (jetton: JettonAsset) => {
  const provider = useContext(TonProviderContext);
  const account = useContext(AccountStateContext);
  const network = useContext(NetworkContext);

  const client = useQueryClient();
  return useQuery(
    [QueryType.jetton, jetton.minterAddress, account.activeWallet],
    async () => {
      const jettonWalletAddress = await getJettonWalletAddress(
        client,
        network,
        provider,
        jetton,
        account
      );

      if (!jettonWalletAddress) {
        throw new Error("Missing jetton wallet address.");
      }

      const dao = new JettonWalletDao(provider, jettonWalletAddress);
      const data = await dao.getData();
      return data.balance.toString();
    }
  );
};
