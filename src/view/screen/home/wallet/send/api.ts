import {
  Address, base64ToBytes, bytesToBase64, bytesToHex,
  Cell, concatBytes,
  EstimateFeeValues,
  Method, stringToBase64,
  toNano,
  TonDns,
  TonHttpProvider,
  TransferParams,
} from "@openproduct/web-sdk";
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
import {checkBalanceOrDie, getPublicKey, getWalletKeyPair} from "../../../api";
import { useNetworkConfig } from "../../api";
import { getSharedSecret } from "@noble/ed25519";
import nacl, { randomBytes } from "tweetnacl";

export interface TransactionState {
  address: string;
  amount: string;
  max: string;
  data: string | Uint8Array | Cell | undefined;
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
    if(typeof value === "boolean" && value) {
      acc[key] = "1";
    }
    if(typeof value !== "boolean") {
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

  if (toAddress.endsWith(".ton")) {
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

export const useSendMethod = (state?: TransactionState, balance?: string) => {
  const contract = useContext(WalletContractContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);
  const config = useNetworkConfig();

  return useQuery<WrapperMethod, Error>(
    [QueryType.method, wallet.address, state],
    async () => {
      if (!state) {
        throw new Error("Missing send state");
      }

      await checkBalanceOrDie(balance, toNano(state.amount));

      const [toAddress, keyPair, seqno] = await getTransactionsParams(
        ton,
        config,
        state.address,
        wallet
      );

      let payload = state.data || "";

      if(state.isEncrypt && state.data && typeof state.data === "string") {
        const receiverPublicKey = await getPublicKey(ton, toAddress);
        const sharedKey = await getSharedSecret(bytesToHex(keyPair.secretKey.slice(0, 32)), receiverPublicKey);
        console.log("sharedKey", bytesToBase64(sharedKey));
        const nonce = randomBytes(nacl.box.nonceLength);
        console.log("nonce", bytesToBase64(nonce));
        const encrypted = nacl.box.after(
          base64ToBytes(stringToBase64(state.data)),
          nonce,
          sharedKey
        );

        console.log("encrypted", bytesToBase64(encrypted));

        if (!encrypted) {
          throw new Error(
            "Encryption error"
          );
        }

        payload = concatBytes(nonce, encrypted);
        console.log("payload", bytesToBase64(payload))
      }

      const sendMode =
        state.max === "1"
          ? SendMode.CARRRY_ALL_REMAINING_BALANCE
          : SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS;

      const params: TransferParams = {
        secretKey: keyPair.secretKey,
        toAddress,
        amount: toNano(state.amount),
        seqno: seqno,
        payload,
        sendMode,
      };

      const method = contract.transfer(params);

      return { method, seqno };
    },
    { enabled: balance != null && state != null, retry: 0 }
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
