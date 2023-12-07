import { Address, toNano, TonDns, TonHttpProvider } from "@openproduct/web-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import { TonClient } from "ton";
import { Address as CoreAddress } from "ton-core";
import { NetworkConfig } from "../../../../../libs/entries/network";
import { EstimateFeeValues } from "../../../../../libs/entries/tonCenter";
import { WalletState } from "../../../../../libs/entries/wallet";
import { getWalletContract } from "../../../../../libs/service/transfer/core";
import {
  getEstimatePayload,
  getPayload,
} from "../../../../../libs/service/transfer/payload";
import { validateAddressRestrictions } from "../../../../../libs/service/transfer/restrictionService";
import {
  createLedgerTonTransfer,
  createTonTransfer,
  TransactionState,
} from "../../../../../libs/service/transfer/tonService";
import { QueryType } from "../../../../../libs/store/browserStore";
import {
  TonClientContext,
  TonProviderContext,
  WalletStateContext,
} from "../../../../context";
import { checkBalanceOrDie, getWalletKeyPair } from "../../../api";
import { signLedgerTransaction } from "../../../ledger/api";
import { useSelectedNetworkConfig } from "../../api";

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

export const useTargetAddress = (address: string) => {
  const client = useContext(TonClientContext);
  const ton = useContext(TonProviderContext);
  const config = useSelectedNetworkConfig();

  return useQuery<string, Error>([QueryType.address, address], async () => {
    const value = await getToAddress(ton, config, address);
    const coreAddress = CoreAddress.parse(value);
    const deployed = await client.isContractDeployed(coreAddress);
    return coreAddress.toString({ urlSafe: true, bounceable: deployed });
  });
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

      const payload = await getEstimatePayload(
        tonClient,
        address,
        state.isEncrypt,
        state.data
      );
      const transaction = createTonTransfer(0, wallet, address, state, payload);

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

const sendLedgerTransaction = async (
  tonClient: TonClient,
  wallet: WalletState,
  address: string,
  state: TransactionState
): Promise<number> => {
  const contract = getWalletContract(wallet);
  const tonContract = tonClient.open(contract);

  const balance = await tonContract.getBalance();
  if (state.max !== "1") {
    await checkBalanceOrDie(balance.toString(), toNano(state.amount));
  }
  const seqno = await tonContract.getSeqno();

  const payload = await getPayload(
    tonClient,
    address,
    state.isEncrypt,
    state.data
  );
  const transaction = createLedgerTonTransfer(seqno, address, state, payload);

  const signed = await signLedgerTransaction(transaction);
  await tonContract.send(signed);

  return seqno;
};

const sendMnemonicTransaction = async (
  tonClient: TonClient,
  wallet: WalletState,
  address: string,
  state: TransactionState
) => {
  await validateAddressRestrictions(address);
  const keyPair = await getWalletKeyPair(wallet);

  const secretKey = Buffer.from(keyPair.secretKey);

  const contract = getWalletContract(wallet);
  const tonContract = tonClient.open(contract);

  const balance = await tonContract.getBalance();

  if (state.max !== "1") {
    await checkBalanceOrDie(balance.toString(), toNano(state.amount));
  }

  const seqno = await tonContract.getSeqno();

  const payload = await getPayload(
    tonClient,
    address,
    state.isEncrypt,
    state.data,
    secretKey
  );
  const transaction = createTonTransfer(
    seqno,
    wallet,
    address,
    state,
    payload,
    undefined,
    secretKey
  );

  await tonContract.send(transaction);
  return seqno;
};

export const useSendTransaction = () => {
  const tonClient = useContext(TonClientContext);
  const wallet = useContext(WalletStateContext);

  return useMutation<
    number,
    Error,
    { address: string; state: TransactionState }
  >(async ({ address, state }) => {
    if (wallet.ledger) {
      return sendLedgerTransaction(tonClient, wallet, address, state);
    } else {
      return sendMnemonicTransaction(tonClient, wallet, address, state);
    }
  });
};
