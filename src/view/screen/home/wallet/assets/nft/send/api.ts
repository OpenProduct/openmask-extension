import {
  Address,
  nftTransferBody,
  toNano,
  TransferParams,
} from "@openproduct/web-sdk";
import { useQuery } from "@tanstack/react-query";
import BN from "bn.js";
import { useContext } from "react";
import { SendMode } from "../../../../../../../libs/entries/tonSendMode";
import { QueryType } from "../../../../../../../libs/store/browserStore";
import {
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "../../../../../../context";
import { checkBalanceOrDie } from "../../../../../api";
import { useNetworkConfig } from "../../../../api";
import { getTransactionsParams, WrapperMethod } from "../../../send/api";
import { NftItemStateContext } from "../context";

export interface SendNftState {
  /**
   * The nft receiver wallet address.
   */
  address: string;
  /**
   * The amount of ton to cover transaction and storage cost.
   * default - 0.05
   */
  amount: string;
  /**
   * The amount of ton from `amount` with would be sent to the nft receiver to notify it.
   * The value should be less then `amount`.
   * default - 0.000000001
   */
  forwardAmount: string;

  /**
   * The forward comment with should show to nft receiver with `forwardAmount`
   * I can't send transaction to receiver have a forwarded message,
   * if some one have an idea how wrap the text, I will appreciate for help
   */
  comment: string;
}

export const toSendNftState = (searchParams: URLSearchParams): SendNftState => {
  return {
    address: decodeURIComponent(searchParams.get("address") ?? ""),
    amount: decodeURIComponent(searchParams.get("amount") ?? ""),
    forwardAmount: decodeURIComponent(searchParams.get("forwardAmount") ?? ""),
    comment: decodeURIComponent(searchParams.get("comment") ?? ""),
  };
};

export const stateToSearch = (state: SendNftState) => {
  return Object.entries(state).reduce((acc, [key, value]) => {
    acc[key] = encodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
};

export const useTransferNftMethod = (
  state: SendNftState,
  balance: string | undefined
) => {
  const contract = useContext(WalletContractContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);
  const config = useNetworkConfig();

  const nft = useContext(NftItemStateContext);

  return useQuery<WrapperMethod, Error>(
    [QueryType.method, wallet.address, state],
    async () => {
      const amount = toNano(state.amount ? state.amount : "0.05");
      const forwardAmount = state.forwardAmount
        ? toNano(state.forwardAmount)
        : new BN(1, 10);

      await checkBalanceOrDie(balance, amount);

      const nftAddress = new Address(nft.address);
      const forwardPayload = new TextEncoder().encode(state.comment ?? "");

      const [newOwnerAddress, keyPair, seqno] = await getTransactionsParams(
        ton,
        config,
        state.address,
        wallet
      );

      const payload = nftTransferBody({
        newOwnerAddress: new Address(newOwnerAddress),
        responseAddress: new Address(wallet.address),
        forwardAmount,
        forwardPayload,
      });

      const params: TransferParams = {
        secretKey: keyPair.secretKey,
        toAddress: nftAddress,
        amount,
        seqno: seqno,
        payload,
        sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
      };

      const method = contract.transfer(params);

      return { method, seqno };
    },
    { retry: 1 }
  );
};
