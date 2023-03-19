import {
  Address,
  beginCell,
  Builder,
  internal,
  SendMode,
  toNano,
} from "ton-core";
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
    sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
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
  seqno: number,
  walletState: WalletState,
  recipientAddress: string,
  state: SendNftState,
  nft: NftItem
): LedgerTransfer => {
  const body = nftTransferBody({
    queryId: Date.now(),
    newOwnerAddress: Address.parse(recipientAddress),
    responseAddress: Address.parse(walletState.address),
    forwardAmount: toNano(state.forwardAmount),
    forwardPayload: null,
  });

  const transaction = {
    to: Address.parse(nft.address),
    amount: toNano(state.amount),
    sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
    seqno,
    timeout: Math.floor(Date.now() / 1000 + 60),
    bounce: true,
    payload: { type: "unsafe", message: body } as const,
  };

  return transaction;
};
