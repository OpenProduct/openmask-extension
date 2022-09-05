import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Address,
  Dns,
  HttpProvider,
  Method,
  toNano,
  TransferParams,
} from "@tonmask/web-sdk";
import { BN } from "bn.js";
import { useContext } from "react";
import * as tonMnemonic from "tonweb-mnemonic";
import { NetworkConfig } from "../../../../../libs/entries/network";
import { ErrorCode, RuntimeError } from "../../../../../libs/exception";
import { QueryType } from "../../../../../libs/store/browserStore";
import {
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "../../../../context";
import { decryptMnemonic } from "../../../api";
import { askBackgroundPassword } from "../../../import/api";
import { useNetworkConfig } from "../../api";

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

const getToAddress = async (
  ton: HttpProvider,
  config: NetworkConfig,
  toAddress: string
) => {
  if (Address.isValid(toAddress)) {
    return toAddress;
  }
  toAddress = toAddress.toLowerCase();

  if (toAddress.endsWith(".ton")) {
    const dns = new Dns(ton, { rootDnsAddress: config.rootDnsAddress });
    const address = await dns.getWalletAddress(toAddress);
    if (!address) {
      throw new Error("Invalid address");
    }
    if (!Address.isValid(address)) {
      throw new Error("Invalid address");
    }
    return new Address(address).toString(true, true, true);
  } else {
    throw new Error("Invalid address");
  }
};

export enum SendMode {
  CARRRY_ALL_REMAINING_BALANCE = 128,
  CARRRY_ALL_REMAINING_INCOMING_VALUE = 64,
  DESTROY_ACCOUNT_IF_ZERO = 32,
  PAY_GAS_SEPARATLY = 1,
  IGNORE_ERRORS = 2,
}

interface WrapperMethod {
  method: Method;
  seqno: number;
}
export const useMethod = (state: State, balance?: string) => {
  const contract = useContext(WalletContractContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);
  const config = useNetworkConfig();

  return useQuery<WrapperMethod, Error>(
    [QueryType.method, state],
    async () => {
      if (balance) {
        if (new BN(balance).cmp(toNano(state.amount)) === -1) {
          throw new RuntimeError(
            ErrorCode.unexpectedParams,
            "Don't enough wallet balance"
          );
        }
      }

      const [toAddress, keyPair, seqno] = await Promise.all([
        getToAddress(ton, config, state.address),
        (async () => {
          const mnemonic = await decryptMnemonic(
            wallet.mnemonic,
            await askBackgroundPassword()
          );
          return await tonMnemonic.mnemonicToKeyPair(mnemonic.split(" "));
        })(),
        ton.getSeqno(wallet.address),
      ] as const);

      const sendMode =
        state.max === "1"
          ? SendMode.CARRRY_ALL_REMAINING_BALANCE
          : SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS;

      const params: TransferParams = {
        secretKey: keyPair.secretKey,
        toAddress,
        amount: toNano(state.amount),
        seqno: seqno,
        payload: state.comment,
        sendMode,
      };

      const method = contract.transfer(params);

      return { method, seqno };
    },
    { enabled: balance != null }
  );
};

interface Estimation {
  in_fwd_fee: number;
  storage_fee: number;
  gas_fee: number;
  fwd_fee: number;
}

export const useEstimateFee = (wmethod: WrapperMethod | undefined) => {
  return useQuery<Estimation>(
    [QueryType.estimation],
    async () => {
      const all_fees = await wmethod!.method.estimateFee();
      console.log(all_fees);
      return all_fees.source_fees;
    },
    { enabled: wmethod != null }
  );
};

export const useSendMutation = () => {
  return useMutation<number, Error, WrapperMethod>(
    async (wmethod: WrapperMethod) => {
      await wmethod.method.send();
      return wmethod.seqno;
    }
  );
};
