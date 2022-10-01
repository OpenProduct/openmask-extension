import { Cell } from "@openmask/web-sdk/build/boc/cell";
import { Method } from "@openmask/web-sdk/build/contract/contract";
import { jettonTransferBody } from "@openmask/web-sdk/build/contract/token/ft/utils";
import { TransferParams } from "@openmask/web-sdk/build/contract/wallet/walletContract";
import Address from "@openmask/web-sdk/build/utils/address";
import { toNano } from "@openmask/web-sdk/build/utils/utils";
import { useQuery } from "@tanstack/react-query";
import BN from "bn.js";
import { useContext } from "react";
import { JettonAsset } from "../../../../../../../libs/entries/asset";
import { SendMode } from "../../../../../../../libs/entries/tonSendMode";
import { ErrorCode, RuntimeError } from "../../../../../../../libs/exception";
import { QueryType } from "../../../../../../../libs/store/browserStore";
import {
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "../../../../../../context";
import { useNetworkConfig } from "../../../../api";
import { getTransactionsParams } from "../../../send/api";

export interface SendJettonState {
  address: string;
  /**
   * Amount of jettons to transfer
   */
  amount: string;

  /**
   * TON Amount with would be transfer to handle internal transaction expenses
   * By default community agreed to 0.1 TON
   */
  transactionAmount: string;

  /**
   * The amount of ton from `transactionAmount` with would be sent to the jetton receiver to notify it.
   * The value should be less then `transactionAmount`.
   * default - 0.000000001
   */
  forwardAmount?: string;

  comment: string;
}

export const toSendJettonState = (
  searchParams: URLSearchParams
): SendJettonState => {
  return {
    address: decodeURIComponent(searchParams.get("address") ?? ""),
    amount: decodeURIComponent(searchParams.get("amount") ?? ""),
    transactionAmount: decodeURIComponent(
      searchParams.get("transactionAmount") ?? ""
    ),
    comment: decodeURIComponent(searchParams.get("comment") ?? ""),
  };
};

export const stateToSearch = (state: SendJettonState) => {
  return Object.entries(state).reduce((acc, [key, value]) => {
    acc[key] = encodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
};

interface WrapperMethod {
  method: Method;
  seqno: number;
}

export const useSendJettonMethod = (
  { walletAddress }: JettonAsset,
  state: SendJettonState,
  balance: string | undefined
) => {
  const contract = useContext(WalletContractContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);
  const config = useNetworkConfig();

  return useQuery<WrapperMethod, Error>(
    [QueryType.method, wallet.address, state],
    async () => {
      if (balance) {
        if (new BN(balance).cmp(toNano(state.amount)) === -1) {
          throw new RuntimeError(
            ErrorCode.unexpectedParams,
            "Don't enough Jetton Wallet balance"
          );
        }
      }
      if (!walletAddress) {
        throw new Error("Jetton Wallet Not Found.");
      }
      const jettonWalletAddress = new Address(walletAddress);

      const [toAddress, keyPair, seqno] = await getTransactionsParams(
        ton,
        config,
        state.address,
        wallet
      );

      const transactionAmount =
        state.transactionAmount == ""
          ? toNano("0.10")
          : toNano(state.transactionAmount);

      const forwardAmount = state.forwardAmount
        ? toNano(state.forwardAmount)
        : new BN(1, 10);

      const payloadCell = new Cell();
      payloadCell.bits.writeUint(0, 32);
      payloadCell.bits.writeString(state.comment);

      const payload = jettonTransferBody({
        toAddress: new Address(toAddress),
        responseAddress: new Address(wallet.address),
        jettonAmount: toNano(state.amount),
        forwardAmount,
        forwardPayload: payloadCell.bits.getTopUppedArray(),
      });

      const params: TransferParams = {
        secretKey: keyPair.secretKey,
        toAddress: jettonWalletAddress,
        amount: transactionAmount,
        seqno: seqno,
        payload,
        sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
      };

      const method = contract.transfer(params);

      return { method, seqno };
    },
    { enabled: balance != null }
  );
};
