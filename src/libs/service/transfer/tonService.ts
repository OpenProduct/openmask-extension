import { TonPayloadFormat } from "@ton-community/ton-ledger";
import { Address, Cell, fromNano, internal, SendMode, toNano } from "@ton/core";
import { TonConnectTransactionPayloadMessage } from "../../entries/notificationMessage";
import { WalletState } from "../../entries/wallet";
import { getWalletContract } from "./core";
import { LedgerTransfer } from "./ledger";

export interface AmountValue {
  max?: string;
  amount: string;
}

export interface TransactionState extends AmountValue {
  address: string;
  data: string | Cell | undefined;
  hex?: string;
  isEncrypt?: boolean;
}

export interface InitData {
  code?: Cell;
  data?: Cell;
}

export const getTonSendMode = (max: string | undefined) => {
  return max === "1"
    ? SendMode.CARRY_ALL_REMAINING_BALANCE
    : SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS;
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
  data: AmountValue,
  comment: Cell | string | undefined,
  init?: InitData,
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
        init,
        body: comment,
      }),
    ],
  });

  return transfer;
};

export const toStateInit = (stateInit?: string): InitData | undefined => {
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
    sendMode: SendMode.PAY_GAS_SEPARATELY + SendMode.IGNORE_ERRORS,
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
  wallet: WalletState,
  seqno: number,
  address: string,
  state: AmountValue,
  body: Cell | string | undefined
): LedgerTransfer => {
  const walletContract = getWalletContract(wallet);

  const payload: TonPayloadFormat | undefined = (() => {
    if (body === undefined) {
      return undefined;
    }
    if (typeof body === "string") {
      return { type: "comment", text: body };
    }

    throw new Error("Complex transaction is not supported");
  })();

  const transaction = {
    to: Address.parse(address),
    amount: toNano(state.amount),
    sendMode: getTonSendMode(state.max),
    seqno,
    timeout: Math.floor(Date.now() / 1000 + 60),
    bounce: seeIfBounceable(address),
    stateInit: walletContract.init,
    payload,
  };

  return transaction;
};
