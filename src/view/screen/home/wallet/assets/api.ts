import { Address, JettonMinterDao, JettonWalletDao } from "@openmask/web-sdk";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { QueryType } from "../../../../../libs/store/browserStore";
import { TonProviderContext, WalletAddressContext } from "../../../../context";

export const useJettonWalletBalance = (jettonMinterAddress: string) => {
  const provider = useContext(TonProviderContext);
  const wallet = useContext(WalletAddressContext);
  return useQuery([QueryType.jetton, jettonMinterAddress, wallet], async () => {
    const minter = new JettonMinterDao(
      provider,
      new Address(jettonMinterAddress)
    );

    const jettonWalletAddress = await minter.getJettonWalletAddress(
      new Address(wallet)
    );

    if (!jettonWalletAddress) {
      throw new Error("Missing jetton wallet address.");
    }

    const dao = new JettonWalletDao(provider, jettonWalletAddress);
    const data = await dao.getData();
    return data.balance.toString();
  });
};
