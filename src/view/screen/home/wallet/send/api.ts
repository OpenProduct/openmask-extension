import {
  Address,
  Dns,
  EstimateFeeValues,
  HttpProvider,
  Method,
  toNano,
  TransferParams,
} from "@openmask/web-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { NetworkConfig } from "../../../../../libs/entries/network";
import { SendMode } from "../../../../../libs/entries/tonSendMode";
import { WalletState } from "../../../../../libs/entries/wallet";
import { QueryType } from "../../../../../libs/store/browserStore";
import {
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "../../../../context";
import { checkBalanceOrDie, getWalletKeyPair } from "../../../api";
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

export const getTransactionsParams = (
  ton: HttpProvider,
  config: NetworkConfig,
  toAddress: string,
  wallet: WalletState
) => {
  return Promise.all([
    getToAddress(ton, config, toAddress),
    getWalletKeyPair(wallet),
    ton.getSeqno(wallet.address),
  ] as const);
};

export const getToAddress = async (
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

export interface WrapperMethod {
  method: Method;
  seqno: number;
}

export const useSendMethod = (state: State, balance?: string) => {
  const contract = useContext(WalletContractContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);
  const config = useNetworkConfig();

  return useQuery<WrapperMethod, Error>(
    [QueryType.method, wallet.address, state],
    async () => {
      await checkBalanceOrDie(balance, toNano(state.amount));

      const [toAddress, keyPair, seqno] = await getTransactionsParams(
        ton,
        config,
        state.address,
        wallet
      );

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

export const useEstimateFee = (wmethod: WrapperMethod | undefined) => {
  return useQuery<EstimateFeeValues>(
    [QueryType.estimation],
    async () => {
      const all_fees = await wmethod!.method.estimateFee();
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
