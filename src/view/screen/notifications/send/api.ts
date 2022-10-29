import {
  Address,
  base64ToBytes,
  Cell,
  fromNano,
  NftData,
  Slice,
  TonHttpProvider,
} from "@openproduct/web-sdk";
import { useQuery } from "@tanstack/react-query";
import BN from "bn.js";
import { useContext } from "react";
import { NftItemState } from "../../../../libs/entries/asset";
import { TransactionParams } from "../../../../libs/entries/transaction";
import { WalletState } from "../../../../libs/entries/wallet";
import {
  getNftData,
  getNftItemState,
  seeIfSameAddress,
} from "../../../../libs/service/nftService";
import { QueryType } from "../../../../libs/store/browserStore";
import { TonProviderContext, WalletStateContext } from "../../../context";
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

export const toNftTransferState = async (
  provider: TonHttpProvider,
  wallet: WalletState,
  state: TransactionState,
  data: Cell
): Promise<NftTransactionState | undefined> => {
  const nftTransfer = seeIfSendNftTransaction(data);
  if (!nftTransfer) {
    return undefined;
  }

  try {
    const nftDate = await getNftData(provider, state.address);

    const isOwnNft = seeIfSameAddress(wallet.address, nftDate.ownerAddress);

    const nftItemState = nftDate.contentUri
      ? await getNftItemState(nftDate.contentUri)
      : null;

    const result: NftTransactionState = {
      kind: "nft",
      nftTransfer,
      nftDate,
      nftItemState,
      isOwnNft,
      state,
    };
    return result;
  } catch (e) {
    return undefined;
  }
};

export interface NftTransactionState {
  kind: "nft";
  state: TransactionState;
  nftTransfer: NftTransferState;
  nftDate: NftData;
  nftItemState: NftItemState | null;
  isOwnNft: boolean;
}

export interface NftTransferState {
  queryId: BN;
  newOwnerAddress: Address;
  responseAddress: Address;
  customPayload: Cell | null;
  forwardAmount: BN;
  forwardPayload: Cell;
}

export interface PureTransactionState {
  kind: "pure";
  state: TransactionState;
}

export type ParsedTransactionState = PureTransactionState | NftTransactionState;

export const useSendTransactionState = (params: TransactionParams) => {
  const provider = useContext(TonProviderContext);
  const wallet = useContext(WalletStateContext);

  return useQuery<ParsedTransactionState, Error>(
    [QueryType.transactions, wallet.address, params],
    async () => {
      const dataCell = toDataCell(params);

      const state: TransactionState = {
        address: params.to,
        amount: fromNano(params.value),
        max: "0",
        data: dataCell,
        hex: params.data,
      };

      const nftState = await toNftTransferState(
        provider,
        wallet,
        state,
        dataCell
      );
      if (nftState) {
        return nftState;
      }

      const result: ParsedTransactionState = {
        kind: "pure",
        state,
      };
      return result;
    }
  );
};
