import { TonPayloadFormat } from "@ton-community/ton-ledger";
import { Address, SendMode, StateInit } from "@ton/core";

export interface LedgerTransfer {
  to: Address;
  amount: bigint;
  sendMode: SendMode;
  seqno: number;
  timeout: number;
  bounce: boolean;
  stateInit?: StateInit | undefined;
  payload?: TonPayloadFormat | undefined;
}

export function LedgerPathForAccount(
  network: string,
  workchain: number,
  account: number
) {
  let testnet = network === "testnet";
  let networkIndex = testnet ? 1 : 0;
  let chain = workchain === -1 ? 255 : 0;
  return [44, 607, networkIndex, chain, account, 0]; // Last zero is reserved for alternative wallet contracts
}
