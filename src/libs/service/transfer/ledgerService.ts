import { Address, Cell, fromNano } from "@ton/core";
import { TonConnectTransactionPayloadMessage } from "../../entries/notificationMessage";
import { WalletState } from "../../entries/wallet";
import { getWalletContract } from "./core";
import {
  JettonTransferOpCode,
  createLedgerJettonTransferPayload,
  parseJettonTransfer,
} from "./jettonService";
import { LedgerTransfer } from "./ledger";
import {
  NftTransferOpCode,
  createLedgerNftTransferPayload,
  parseNftTransfer,
} from "./nftService";
import { createLedgerTonTransfer } from "./tonService";

export const parseLedgerTransaction = (
  wallet: WalletState,
  seqno: number,
  item: TonConnectTransactionPayloadMessage
): LedgerTransfer => {
  const data = item.payload ? Cell.fromBase64(item.payload) : undefined;

  if (!data) {
    return createLedgerTonTransfer(
      wallet,
      seqno,
      item.address,
      {
        amount: fromNano(item.amount),
      },
      data
    );
  }

  const walletContract = getWalletContract(wallet);

  const operation = data.asSlice().loadUint(32);
  switch (operation) {
    case NftTransferOpCode: {
      const transfer = parseNftTransfer(data);
      return createLedgerNftTransferPayload(
        item.address,
        BigInt(item.amount),
        seqno,
        walletContract.init,
        transfer
      );
    }
    case JettonTransferOpCode: {
      const transfer = parseJettonTransfer(data);
      return createLedgerJettonTransferPayload(
        Address.parse(item.address),
        BigInt(item.amount),
        seqno,
        walletContract.init,
        transfer
      );
    }

    default:
      throw new Error("App Ledger 2.0 is not support custom transaction");
  }
};
