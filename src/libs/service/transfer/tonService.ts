import { Address, Cell, internal, SendMode, toNano } from "ton-core";
import { WalletState } from "../../entries/wallet";
import { getWalletContract } from "./core";

export interface AmountValue {
  max: boolean;
  amount: string;
}

export const createTonTransfer = (
  seqno: number,
  walletState: WalletState,
  address: string,
  data: AmountValue,
  comment: Cell | string | undefined,
  secretKey: Buffer = Buffer.alloc(64)
) => {
  const contract = getWalletContract(walletState);
  const transfer = contract.createTransfer({
    seqno,
    secretKey,
    sendMode: data.max
      ? SendMode.CARRRY_ALL_REMAINING_BALANCE
      : SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
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
