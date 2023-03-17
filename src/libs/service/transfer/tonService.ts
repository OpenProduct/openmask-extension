import { Address, Cell, internal, SendMode, toNano } from "ton-core";
import { TonPayloadFormat } from "ton-ledger";
import { WalletState } from "../../entries/wallet";
import { getWalletContract } from "./core";
import { LadgerTransfer } from "./ladger";

export interface TransactionState {
  address: string;
  amount: string;
  max: string;
  data: string | Cell | undefined;
  hex?: string;
  isEncrypt?: boolean;
}

export interface AmountValue {
  max: boolean;
  amount: string;
}

export const getTonSendMode = (max: boolean | string) => {
  if (typeof max === "string") {
    max = max === "1";
  }

  return max
    ? SendMode.CARRRY_ALL_REMAINING_BALANCE
    : SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS;
};

export const createTonTransfer = (
  seqno: number,
  walletState: WalletState,
  address: string,
  data: TransactionState,
  comment: Cell | string | undefined,
  secretKey: Buffer = Buffer.alloc(64)
) => {
  const contract = getWalletContract(walletState);
  const transfer = contract.createTransfer({
    seqno,
    secretKey,
    sendMode: getTonSendMode(data.max),
    messages: [
      internal({
        to: address,
        bounce: Address.isFriendly(address)
          ? Address.parseFriendly(address).isBounceable
          : false,
        value: toNano(data.amount),
        body: comment,
      }),
    ],
  });

  return transfer;
};

export const createLadgerTonTransfer = (
  seqno: number,
  address: string,
  state: TransactionState,
  body: Cell | string | undefined
): LadgerTransfer => {
  const payload: TonPayloadFormat | undefined = (() => {
    if (body === undefined) {
      return undefined;
    }
    if (typeof body === "string") {
      return { type: "comment", text: body };
    }
    return { type: "unsafe", message: body };
  })();

  const transaction = {
    to: Address.parse(address),
    amount: toNano(state.amount),
    sendMode: getTonSendMode(state.max),
    seqno,
    timeout: Math.floor(Date.now() / 1000 + 60),
    bounce: true,
    payload,
  };

  return transaction;
};
