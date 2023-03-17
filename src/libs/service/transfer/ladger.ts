import { Address } from "ton-core";
import { TonPayloadFormat } from "ton-ledger";

export interface LadgerTransfer {
  to: Address;
  amount: bigint;
  sendMode: number;
  seqno: number;
  timeout: number;
  bounce: boolean;
  payload: TonPayloadFormat | undefined;
}

export function ladgerPathForAccount(
  network: string,
  workchain: number,
  account: number
) {
  let testnet = network === "testnet";
  let networkIndex = testnet ? 1 : 0;
  let chain = workchain === -1 ? 255 : 0;
  return [44, 607, networkIndex, chain, account, 0]; // Last zero is reserved for alternative wallet contracts
}
