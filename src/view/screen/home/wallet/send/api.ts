import {
  Address,
  EstimateFeeValues,
  Method,
  toNano,
  TonDns,
  TonHttpProvider,
} from "@openproduct/web-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { Address as CoreAddress, Cell as CoreCell } from "ton-core";
import { NetworkConfig } from "../../../../../libs/entries/network";
import { WalletState } from "../../../../../libs/entries/wallet";
import { getWalletContract } from "../../../../../libs/service/transfer/core";
import {
  getEstimatePayload,
  getPayload,
} from "../../../../../libs/service/transfer/payload";
import { createTonTransfer } from "../../../../../libs/service/transfer/tonService";
import { QueryType } from "../../../../../libs/store/browserStore";
import {
  TonClientContext,
  TonProviderContext,
  WalletStateContext,
} from "../../../../context";
import { checkBalanceOrDie, getWalletKeyPair } from "../../../api";
import { useSelectedNetworkConfig } from "../../api";

export interface TransactionState {
  address: string;
  amount: string;
  max: string;
  data: string | CoreCell | undefined;
  hex?: string;
  isEncrypt?: boolean;
}

export const toState = (searchParams: URLSearchParams): TransactionState => {
  return {
    address: decodeURIComponent(searchParams.get("address") ?? ""),
    amount: decodeURIComponent(searchParams.get("amount") ?? ""),
    max: searchParams.get("max") ?? "",
    data: decodeURIComponent(searchParams.get("data") ?? ""),
    isEncrypt: searchParams.get("isEncrypt") === "1",
  };
};

export const stateToSearch = (state: TransactionState) => {
  return Object.entries(state).reduce((acc, [key, value]) => {
    if (typeof value === "boolean" && value) {
      acc[key] = "1";
    }
    if (typeof value !== "boolean") {
      acc[key] = encodeURIComponent(value);
    }
    return acc;
  }, {} as Record<string, string>);
};

export const getTransactionsParams = (
  ton: TonHttpProvider,
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
  ton: TonHttpProvider,
  config: NetworkConfig,
  toAddress: string
) => {
  if (Address.isValid(toAddress)) {
    return toAddress;
  }
  toAddress = toAddress.toLowerCase();

  if (toAddress.endsWith(".ton") || toAddress.endsWith(".t.me")) {
    const dns = new TonDns(ton, { rootDnsAddress: config.rootDnsAddress });
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

export const useTargetAddress = (address: string) => {
  const ton = useContext(TonProviderContext);
  const config = useSelectedNetworkConfig();

  return useQuery<string, Error>([QueryType.address, address], () =>
    getToAddress(ton, config, address)
  );
};

export const useEstimateTransaction = (
  state?: TransactionState,
  address?: string
) => {
  const tonClient = useContext(TonClientContext);
  const wallet = useContext(WalletStateContext);

  return useQuery<EstimateFeeValues>(
    [QueryType.estimation, state],
    async () => {
      if (!state || !address) {
        throw new Error("missing state");
      }

      const transaction = createTonTransfer(
        0,
        wallet,
        address,
        { max: state.max === "1", amount: state.amount },
        await getEstimatePayload(
          tonClient,
          address,
          state.isEncrypt,
          state.data
        )
      );

      const data = await tonClient.estimateExternalMessageFee(
        CoreAddress.parse(wallet.address),
        {
          body: transaction,
          initCode: null,
          initData: null,
          ignoreSignature: true,
        }
      );
      return data.source_fees as EstimateFeeValues;
    },
    { enabled: state != null && address != null }
  );
};

export const useSendTransaction = () => {
  const tonClient = useContext(TonClientContext);
  const wallet = useContext(WalletStateContext);

  return useMutation<
    number,
    Error,
    { address: string; state: TransactionState }
  >(async ({ address, state }) => {
    const keyPair = await getWalletKeyPair(wallet);

    const secretKey = Buffer.from(keyPair.secretKey);

    const contract = getWalletContract(wallet);
    const tonContract = tonClient.open(contract);

    const balance = await tonContract.getBalance();

    await checkBalanceOrDie(balance.toString(), toNano(state.amount));

    const seqno = await tonContract.getSeqno();
    const transaction = createTonTransfer(
      seqno,
      wallet,
      address,
      { max: state.max === "1", amount: state.amount },
      await getPayload(
        tonClient,
        address,
        state.isEncrypt,
        state.data as any,
        secretKey
      ),
      secretKey
    );

    await tonContract.send(transaction);
    return seqno;
  });
};
