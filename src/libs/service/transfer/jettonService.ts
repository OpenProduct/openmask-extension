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
import BigNumber from "bignumber.js";
import { JettonAsset } from "../../entries/asset";
import { WalletState } from "../../entries/wallet";
import { getWalletContract } from "./core";
import { LedgerTransfer } from "./ledger";

export interface SendJettonState {
  /**
   * The Jetton receiver main wallet address.
   */
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

  /**
   * The forward comment with should show to jetton receiver with `forwardAmount`
   * I can't send transaction to receiver have a forwarded message,
   * if some one have an idea how wrap the text, I will appreciate for help
   */
  comment: string;
}

const DefaultDecimals = 9;

const jettonTransferForwardAmount = toNano("0.0001");

export const JettonTransferOpCode = 0xf8a7ea5;

const jettonTransferBody = (params: {
  queryId?: number;
  jettonAmount: bigint;
  toAddress: Address;
  responseAddress: Address;
  forwardAmount: bigint;
  forwardPayload: Builder | null;
}) => {
  return beginCell()
    .storeUint(0xf8a7ea5, 32) // request_transfer op
    .storeUint(params.queryId || 0, 64)
    .storeCoins(params.jettonAmount)
    .storeAddress(params.toAddress)
    .storeAddress(params.responseAddress)
    .storeBit(false) // null custom_payload
    .storeCoins(params.forwardAmount)
    .storeBit(false) // forward_payload in this slice, not separate cell
    .storeMaybeBuilder(params.forwardPayload)
    .endCell();
};

export const parseJettonTransfer = (data: Cell): TonPayloadFormat => {
  const slice = data.asSlice();

  const operation = slice.loadUint(32);
  if (operation != JettonTransferOpCode) {
    throw new Error("Invalid operator");
  }

  const queryId = slice.loadUint(64);
  const jettonAmount = slice.loadCoins();
  const toAddress = slice.loadMaybeAddress();
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
    type: "jetton-transfer",
    queryId: BigInt(queryId),
    amount: jettonAmount,
    destination: toAddress!,
    responseDestination: responseAddress!,
    customPayload: customPayload,
    forwardAmount: forwardAmount,
    forwardPayload: forwardPayload,
  };
};

const getJettonAmount = (data: SendJettonState, jetton: JettonAsset) => {
  const decimals = jetton.state.decimals
    ? parseInt(String(jetton.state.decimals))
    : DefaultDecimals;

  return BigInt(
    new BigNumber(data.amount)
      .shiftedBy(decimals)
      .toFormat({ decimalSeparator: ".", groupSeparator: "" })
  );
};

export const createJettonTransfer = (
  seqno: number,
  walletState: WalletState,
  recipientAddress: string,
  jettonWalletAddress: Address,
  data: SendJettonState,
  jetton: JettonAsset,
  secretKey: Buffer = Buffer.alloc(64)
) => {
  const body = jettonTransferBody({
    queryId: Date.now(),
    jettonAmount: getJettonAmount(data, jetton),
    toAddress: Address.parse(recipientAddress),
    responseAddress: Address.parse(walletState.address),
    forwardAmount: jettonTransferForwardAmount,
    forwardPayload: null,
  });

  const contract = getWalletContract(walletState);
  const transfer = contract.createTransfer({
    seqno,
    secretKey,
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    messages: [
      internal({
        to: jettonWalletAddress,
        bounce: true,
        value: toNano(data.transactionAmount),
        body,
      }),
    ],
  });

  return transfer;
};

export const createLedgerJettonTransfer = (
  wallet: WalletState,
  seqno: number,
  recipientAddress: string,
  jettonWalletAddress: Address,
  data: SendJettonState,
  jetton: JettonAsset
): LedgerTransfer => {
  const walletContract = getWalletContract(wallet);

  return createLedgerJettonTransferPayload(
    jettonWalletAddress,
    toNano(data.transactionAmount),
    seqno,
    walletContract.init,
    {
      type: "jetton-transfer",
      queryId: BigInt(Date.now()),
      amount: getJettonAmount(data, jetton),
      destination: Address.parse(recipientAddress),
      responseDestination: Address.parse(wallet.address),
      customPayload: null,
      forwardAmount: jettonTransferForwardAmount,
      forwardPayload: null,
    }
  );
};

export const createLedgerJettonTransferPayload = (
  address: Address,
  amount: bigint,
  seqno: number,
  stateInit: { data: Cell; code: Cell },
  payload: TonPayloadFormat
): LedgerTransfer => {
  const transaction = {
    to: address,
    amount: amount,
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
    seqno,
    timeout: Math.floor(Date.now() / 1000 + 60),
    bounce: true,
    stateInit: stateInit,
    payload,
  };
  return transaction;
};
