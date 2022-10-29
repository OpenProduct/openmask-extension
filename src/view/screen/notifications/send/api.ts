import {
  Address,
  base64ToBytes,
  Cell,
  fromNano,
  Slice,
} from "@openproduct/web-sdk";
import { useQuery } from "@tanstack/react-query";
import BN from "bn.js";
import { TransactionParams } from "../../../../libs/entries/transaction";
import { QueryType } from "../../../../libs/store/browserStore";
import { TransactionState } from "../../home/wallet/send/api";

const toDataCell = (params: TransactionParams) => {
  if (!params.data) return new Cell();

  switch (params.dataType) {
    case "hex":
      return Cell.oneFromBoc(params.data);
    case "boc":
      return Cell.oneFromBoc(base64ToBytes(params.data));
    case "base64": {
      const bytes = base64ToBytes(params.data);
      const payloadCell = new Cell();
      payloadCell.bits.writeBytes(bytes);
      return payloadCell;
    }
    default: {
      const payloadCell = new Cell();
      if (params.data.length > 0) {
        payloadCell.bits.writeUint(0, 32);
        payloadCell.bits.writeString(params.data);
      }
      return payloadCell;
    }
  }
};

const seeIfSendNftTransaction = (payload: Cell): false | NftTransferState => {
  try {
    const slice: Slice = payload.beginParse();

    const operator = slice.loadUint(32);
    if (!operator.eq(new BN(0x5fcc3d14))) {
      return false;
    }

    const queryId = slice.loadUint(64);

    const newOwnerAddress = slice.loadAddress();
    if (newOwnerAddress == null) {
      return false;
    }
    const responseAddress = slice.loadAddress();
    if (responseAddress === null) {
      return false;
    }

    const customPayload = slice.loadBit() ? slice.loadRef().toCell() : null;

    const forwardAmount = slice.loadCoins();

    const forwardPayload = slice.loadBit()
      ? slice.loadRef().toCell()
      : slice.toCell();

    return {
      queryId,
      newOwnerAddress,
      responseAddress,
      customPayload,
      forwardAmount,
      forwardPayload,
    };
  } catch (e) {
    return false;
  }
};

export interface NftTransferState {
  queryId: BN;
  newOwnerAddress: Address;
  responseAddress: Address;
  customPayload: Cell | null;
  forwardAmount: BN;
  forwardPayload: Cell;
}

export type ParsedTransactionState =
  | { kind: "simple"; state: TransactionState }
  | { kind: "nft"; state: TransactionState; nftTransfer: NftTransferState };

export const useSendTransactionState = (params: TransactionParams) => {
  return useQuery<ParsedTransactionState, Error>(
    [QueryType.transactions, params],
    () => {
      const dataCell = toDataCell(params);

      const state: TransactionState = {
        address: params.to,
        amount: fromNano(params.value),
        max: "0",
        data: dataCell,
        hex: params.data,
      };

      const nftTransfer = seeIfSendNftTransaction(dataCell);
      if (nftTransfer) {
        const result: ParsedTransactionState = {
          kind: "nft",
          nftTransfer,
          state,
        };
        return result;
      }

      const result: ParsedTransactionState = {
        kind: "simple",
        state,
      };
      return result;
    }
  );
};
