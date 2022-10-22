import {
  base64ToBytes,
  Cell,
  fromNano,
  hexToBytes,
} from "@openproduct/web-sdk";
import { useQuery } from "@tanstack/react-query";
import { TransactionParams } from "../../../../libs/entries/transaction";
import { QueryType } from "../../../../libs/store/browserStore";
import { TransactionState } from "../../home/wallet/send/api";

const toData = (params: TransactionParams) => {
  if (params.data) {
    if (params.dataType === "hex") {
      return hexToBytes(params.data);
    } else if (params.dataType === "base64") {
      return base64ToBytes(params.data);
    } else if (params.dataType === "boc") {
      return Cell.oneFromBoc(base64ToBytes(params.data));
    }
  }
  return params.data;
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
