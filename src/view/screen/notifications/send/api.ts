import { useQuery } from "@tanstack/react-query";
import { beginCell, Cell, fromNano } from "@ton/core";
import { TransactionParams } from "../../../../libs/entries/transaction";
import { TransactionState } from "../../../../libs/service/transfer/tonService";
import { QueryType } from "../../../../libs/store/browserStore";

const toData = (params: TransactionParams) => {
  if (!params.data) return undefined;

  switch (params.dataType) {
    case "hex":
      return Cell.fromBoc(Buffer.from(params.data, "hex"))[0];
    case "base64":
      return beginCell()
        .storeBuffer(Buffer.from(params.data, "base64"))
        .endCell();
    case "boc":
      return Cell.fromBase64(params.data);
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
