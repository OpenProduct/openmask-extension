import { TonPayloadFormat } from "@ton-community/ton-ledger";
import {
  Address,
  beginCell,
  Builder,
  Cell,
  internal,
  SendMode,
  toNano,
} from "@ton/core";
import { NftItem } from "../../entries/asset";
import { WalletState } from "../../entries/wallet";
import { getWalletContract } from "./core";
import { LedgerTransfer } from "./ledger";

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

export const NftTransferOpCode = 0x5fcc3d14;

const nftTransferBody = (params: {
  queryId?: number;
  newOwnerAddress: Address;
  responseAddress: Address;
  forwardAmount: bigint;
  forwardPayload: Builder | null;
}) => {
  return beginCell()
    .storeUint(0x5fcc3d14, 32) // transfer op
    .storeUint(params.queryId || 0, 64)
    .storeAddress(params.newOwnerAddress)
    .storeAddress(params.responseAddress)
    .storeBit(false) // null custom_payload
    .storeCoins(params.forwardAmount)
    .storeBit(false) // forward_payload in this slice, not separate cell
    .storeMaybeBuilder(params.forwardPayload)
    .endCell();
};

export const parseNftTransfer = (data: Cell): TonPayloadFormat => {
  const slice = data.asSlice();

  const operation = slice.loadUint(32);
  if (operation != NftTransferOpCode) {
    throw new Error("Invalid operator");
  }

  const queryId = slice.loadUint(64);
  const newOwnerAddress = slice.loadMaybeAddress();
  const responseAddress = slice.loadMaybeAddress();
  const isCustomPayload = slice.loadBit();
  const customPayload = isCustomPayload ? slice.loadRef() : null;
  const forwardAmount = slice.loadCoins();
  const isForwardPayload = slice.loadBit();
  const forwardPayload = isForwardPayload
    ? slice.loadRef()
    : slice.remainingBits > 0
    ? slice.asCell()
    : null;

  return {
    type: "nft-transfer",
    queryId: BigInt(queryId),
    newOwner: newOwnerAddress!,
    responseDestination: responseAddress!,
    customPayload: customPayload,
    forwardAmount: forwardAmount,
    forwardPayload: forwardPayload,
  };
};

export const createNftTransfer = (
  seqno: number,
  walletState: WalletState,
  recipientAddress: string,
  state: SendNftState,
  nft: NftItem,
  secretKey: Buffer = Buffer.alloc(64)
) => {
  const body = nftTransferBody({
    queryId: Date.now(),
    newOwnerAddress: Address.parse(recipientAddress),
    responseAddress: Address.parse(walletState.address),
    forwardAmount: toNano(state.forwardAmount),
    forwardPayload: null,
  });

  const contract = getWalletContract(walletState);
  const transfer = contract.createTransfer({
    seqno,
    secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    messages: [
      internal({
        to: Address.parse(nft.address),
        bounce: true,
        value: toNano(state.amount),
        body,
      }),
    ],
  });

  return transfer;
};

export const createLedgerNftTransfer = (
  wallet: WalletState,
  seqno: number,
  recipientAddress: string,
  state: SendNftState,
  nft: NftItem
): LedgerTransfer => {
  const walletContract = getWalletContract(wallet);

  return createLedgerNftTransferPayload(
    nft.address,
    toNano(state.amount),
    seqno,
    walletContract.init,
    {
      type: "nft-transfer",
      queryId: BigInt(Date.now()),
      newOwner: Address.parse(recipientAddress),
      responseDestination: Address.parse(wallet.address),
      customPayload: null,
      forwardAmount: toNano(state.forwardAmount),
      forwardPayload: null,
    }
  );
};

export const createLedgerNftTransferPayload = (
  address: string,
  amount: bigint,
  seqno: number,
  stateInit: { data: Cell; code: Cell },
  payload: TonPayloadFormat
): LedgerTransfer => {
  const transaction = {
    to: Address.parse(address),
    amount: amount,
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    seqno,
    timeout: Math.floor(Date.now() / 1000 + 60),
    bounce: true,
    stateInit,
    payload: payload,
  };
  return transaction;
};
