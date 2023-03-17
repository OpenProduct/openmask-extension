import { useQuery } from "@tanstack/react-query";
import { Cell, fromNano } from "ton-core";
import { TransactionParams } from "../../../../libs/entries/transaction";
import { QueryType } from "../../../../libs/store/browserStore";
import { TransactionState } from "../../home/wallet/send/api";

const toData = (params: TransactionParams) => {
  if (!params.data) return undefined;

  switch (params.dataType) {
    case "hex":
      return Cell.fromBase64(
        Buffer.from(params.data, "hex").toString("base64")
      );
    case "base64":
      return Cell.fromBase64(params.data);
    case "boc":
      return Cell.fromBoc(Buffer.from(params.data))[0];
    default:
      return params.data;
  }
};

export const useSendTransactionState = (params: TransactionParams) => {
  return useQuery<TransactionState, Error>(
    [QueryType.transactions, params],
    () => {
      return {
        address: params.to,
        amount: fromNano(params.value),
        max: "0",
        data: toData(params),
        hex: params.data,
      };
    }
  );
};
