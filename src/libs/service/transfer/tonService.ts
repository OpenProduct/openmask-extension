import {
  Address,
  Cell,
  fromNano,
  internal,
  SendMode,
  StateInit,
  toNano,
} from "ton-core";
import { TonPayloadFormat } from "ton-ledger";
import { TonConnectTransactionPayloadMessage } from "../../entries/notificationMessage";
import { WalletState } from "../../entries/wallet";
import { getWalletContract } from "./core";
import { LedgerTransfer } from "./ledger";

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

const seeIfBounceable = (address: string) => {
  return Address.isFriendly(address)
    ? Address.parseFriendly(address).isBounceable
    : false;
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
        bounce: seeIfBounceable(address),
        value: toNano(data.amount),
        body: comment,
      }),
    ],
  });

  return transfer;
};

export const toStateInit = (stateInit?: string) => {
  if (!stateInit) {
    return undefined;
  }
  const initSlice = Cell.fromBase64(stateInit).asSlice();
  return {
    code: initSlice.loadRef(),
    data: initSlice.loadRef(),
  };
};

export const createTonConnectTransfer = (
  wallet: WalletState,
  seqno: number,
  state: TonConnectTransactionPayloadMessage[],
  secretKey: Buffer = Buffer.alloc(64)
) => {
  const walletContract = getWalletContract(wallet);

  const transfer = walletContract.createTransfer({
    secretKey,
    seqno,
    sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
    messages: state.map((item) => {
      return internal({
        to: item.address,
        value: toNano(fromNano(item.amount)),
        bounce: seeIfBounceable(item.address),
        init: toStateInit(item.stateInit),
        body: item.payload ? Cell.fromBase64(item.payload) : undefined,
      });
    }),
  });

  return transfer;
};

export const createLedgerTonTransfer = (
  seqno: number,
  address: string,
  state: TransactionState,
  body: Cell | string | undefined,
  stateInit?: StateInit
): LedgerTransfer => {
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
    stateInit,
    payload,
  };

  return transaction;
};
