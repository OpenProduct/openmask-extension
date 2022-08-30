import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import TonWeb, { AddressType } from "tonweb";
import * as tonMnemonic from "tonweb-mnemonic";
import { Cell } from "tonweb/dist/types/boc/cell";
import {
  TransferMethodParams,
  WalletContract,
  WalletContractMethods,
  WalletContractOptions,
} from "tonweb/dist/types/contract/wallet/wallet-contract";
import { WalletState } from "../../../../../libs/entries/wallet";
import { QueryType } from "../../../../../libs/store/browserStore";
import {
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "../../../../context";
import { decryptMnemonic } from "../../../api";
import { askBackgroundPassword } from "../../../import/api";

export interface State {
  address: string;
  amount: string;
  max: string;
  comment: string;
  // Transaction id. Define if transaction init from dApp,
  id?: string;
  origin?: string;
}

export const toState = (searchParams: URLSearchParams): State => {
  return {
    address: decodeURIComponent(searchParams.get("address") ?? ""),
    amount: decodeURIComponent(searchParams.get("amount") ?? ""),
    max: searchParams.get("max") ?? "",
    comment: decodeURIComponent(searchParams.get("comment") ?? ""),
    id: searchParams.get("id") ?? undefined,
    origin: decodeURIComponent(searchParams.get("origin") ?? ""),
  };
};

export const stateToSearch = (state: State) => {
  return Object.entries(state).reduce((acc, [key, value]) => {
    acc[key] = encodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
};

const getToAddress = async (ton: TonWeb, toAddress: string) => {
  if (!TonWeb.utils.Address.isValid(toAddress)) {
    toAddress = toAddress.toLowerCase();
    if (toAddress.endsWith(".ton")) {
      const address: AddressType = await (ton as any).dns.getWalletAddress(
        toAddress
      );
      if (!address) {
        throw new Error("Invalid address");
      }
      if (!TonWeb.utils.Address.isValid(address)) {
        throw new Error("Invalid address");
      }
      toAddress = address.toString(true, true, true);
    } else {
      throw new Error("Invalid address");
    }
  }
  return toAddress;
};

const getSeqno = async (
  contract: WalletContract<WalletContractOptions, WalletContractMethods>
) => {
  let seqno = await contract.methods.seqno().call();
  if (!seqno) seqno = 0;
  return seqno;
};

export enum SendMode {
  CARRRY_ALL_REMAINING_BALANCE = 128,
  CARRRY_ALL_REMAINING_INCOMING_VALUE = 64,
  DESTROY_ACCOUNT_IF_ZERO = 32,
  PAY_GAS_SEPARATLY = 1,
  IGNORE_ERRORS = 2,
}

const getMethod = async (
  ton: TonWeb,
  wallet: WalletState,
  contract: WalletContract<WalletContractOptions, WalletContractMethods>,
  state: State,
  stateInit?: Cell
) => {
  const toAddress = await getToAddress(ton, state.address);
  const password = await askBackgroundPassword();
  const mnemonic = await decryptMnemonic(wallet.mnemonic, password);
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic.split(" "));
  const seqno = await getSeqno(contract);

  const sendMode =
    state.max === "1"
      ? SendMode.CARRRY_ALL_REMAINING_BALANCE
      : SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS;

  const params: TransferMethodParams = {
    secretKey: keyPair.secretKey,
    toAddress,
    amount: TonWeb.utils.toNano(state.amount),
    seqno: seqno,
    payload: state.comment,
    sendMode,
    stateInit,
  };

  console.log("params");
  const method = contract.methods.transfer(params);
  console.log("method");

  return { method, seqno };
};

interface Estimation {
  in_fwd_fee: number;
  storage_fee: number;
  gas_fee: number;
  fwd_fee: number;
}

export const useEstimateFee = (state: State) => {
  const contract = useContext(WalletContractContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);
  return useQuery<Estimation>([QueryType.estimation], async () => {
    const { method } = await getMethod(ton, wallet, contract, state);
    const all_fees = await method.estimateFee();
    console.log(all_fees);
    const fees = all_fees.source_fees;
    return {
      in_fwd_fee: fees.in_fwd_fee,
      storage_fee: fees.storage_fee,
      gas_fee: fees.gas_fee,
      fwd_fee: fees.fwd_fee,
    };
  });
};

export const useSendMutation = () => {
  const contract = useContext(WalletContractContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);
  return useMutation<number, Error, State>(async (state) => {
    const { method, seqno } = await getMethod(ton, wallet, contract, state);
    await method.send();
    return seqno;
  });
};
