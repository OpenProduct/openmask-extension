import { useMutation, useQuery } from "@tanstack/react-query";
import { Address, beginCell, toNano } from "@ton/core";
import { TonClient } from "@ton/ton";
import { useContext } from "react";
import { JettonAsset } from "../../../../../../../libs/entries/asset";
import { EstimateFeeValues } from "../../../../../../../libs/entries/tonCenter";
import { WalletState } from "../../../../../../../libs/entries/wallet";
import { getWalletContract } from "../../../../../../../libs/service/transfer/core";
import {
  SendJettonState,
  createJettonTransfer,
  createLedgerJettonTransfer,
} from "../../../../../../../libs/service/transfer/jettonService";
import { toCoinValue } from "../../../../../../../libs/state/decimalsService";
import { QueryType } from "../../../../../../../libs/store/browserStore";
import {
  TonClientContext,
  WalletStateContext,
} from "../../../../../../context";
import { checkBalanceOrDie2, getWalletKeyPair } from "../../../../../api";
import { signLedgerTransaction } from "../../../../../ledger/api";

export const toSendJettonState = (
  searchParams: URLSearchParams
): SendJettonState => {
  return {
    address: decodeURIComponent(searchParams.get("address") ?? ""),
    amount: decodeURIComponent(searchParams.get("amount") ?? ""),
    transactionAmount: decodeURIComponent(
      searchParams.get("transactionAmount") ?? "0.1"
    ),
    comment: decodeURIComponent(searchParams.get("comment") ?? ""),
  };
};

export const stateToSearch = (state: SendJettonState) => {
  return Object.entries(state).reduce((acc, [key, value]) => {
    acc[key] = encodeURIComponent(value);
    return acc;
  }, {} as Record<string, string>);
};

const getJettonWalletAddress = async (
  tonClient: TonClient,
  jettonMinter: string,
  wallet: string
) => {
  const result = await tonClient.callGetMethod(
    Address.parse(jettonMinter),
    "get_wallet_address",
    [
      {
        type: "slice",
        cell: beginCell().storeAddress(Address.parse(wallet)).endCell(),
      },
    ]
  );

  const jettonWalletAddress = result.stack.readAddress();
  return jettonWalletAddress;
};

const getJettonMasterAddress = async (
  tonClient: TonClient,
  jettonWallet: Address
) => {
  const jettonData = await tonClient.callGetMethod(
    jettonWallet,
    "get_wallet_data"
  );

  const balance = jettonData.stack.readBigNumber();
  const owner = jettonData.stack.readAddress();
  const jettonMaster = jettonData.stack.readAddress();
  return jettonMaster;
};

export const useJettonWalletAddress = (jetton: JettonAsset) => {
  const tonClient = useContext(TonClientContext);
  const wallet = useContext(WalletStateContext);

  return useQuery<Address, Error>([QueryType.account, jetton], async () => {
    const jettonWalletAddress = await getJettonWalletAddress(
      tonClient,
      jetton.minterAddress,
      wallet.address
    );
    const jettonMasterAddress = await getJettonMasterAddress(
      tonClient,
      jettonWalletAddress
    );
    if (
      jettonMasterAddress.toString() !==
      Address.parse(jetton.minterAddress).toString()
    ) {
      throw new Error("Jetton minter address not match");
    }
    return jettonWalletAddress;
  });
};

export const useEstimateJettonFee = (
  jetton: JettonAsset,
  state: SendJettonState
) => {
  const tonClient = useContext(TonClientContext);
  const wallet = useContext(WalletStateContext);

  return useQuery([QueryType.estimation, jetton], async () => {
    if (!jetton.walletAddress) {
      throw new Error("Missing jetton wallet address");
    }

    const transaction = createJettonTransfer(
      0,
      wallet,
      jetton.walletAddress,
      Address.parse(wallet.address),
      state,
      jetton
    );
    const data = await tonClient.estimateExternalMessageFee(
      Address.parse(wallet.address),
      {
        body: transaction,
        initCode: null,
        initData: null,
        ignoreSignature: true,
      }
    );
    return data.source_fees as EstimateFeeValues;
  });
};

const sendLedgerTransaction = async (
  tonClient: TonClient,
  wallet: WalletState,
  jetton: JettonAsset,
  state: SendJettonState,
  balance: string,
  jettonWalletAddress: Address,
  address: string
): Promise<number> => {
  const contract = getWalletContract(wallet);
  const tonContract = tonClient.open(contract);

  const walletBalance = await tonContract.getBalance();

  await checkBalanceOrDie2(
    walletBalance.toString(),
    toNano(state.transactionAmount)
  );
  const jettonAmount = toCoinValue(state.amount, jetton.state.decimals);
  await checkBalanceOrDie2(balance, jettonAmount);

  const seqno = await tonContract.getSeqno();

  const transaction = createLedgerJettonTransfer(
    wallet,
    seqno,
    address,
    jettonWalletAddress,
    state,
    jetton
  );

  const signed = await signLedgerTransaction(transaction);
  await tonContract.send(signed);

  return seqno;
};

const sendMnemonicTransaction = async (
  tonClient: TonClient,
  wallet: WalletState,
  jetton: JettonAsset,
  state: SendJettonState,
  balance: string,
  jettonWalletAddress: Address,
  address: string
) => {
  const keyPair = await getWalletKeyPair(wallet);
  const secretKey = Buffer.from(keyPair.secretKey);

  const contract = getWalletContract(wallet);
  const tonContract = tonClient.open(contract);

  const walletBalance = await tonContract.getBalance();

  await checkBalanceOrDie2(
    walletBalance.toString(),
    toNano(state.transactionAmount)
  );
  const jettonAmount = toCoinValue(state.amount, jetton.state.decimals);
  await checkBalanceOrDie2(balance, jettonAmount);

  const seqno = await tonContract.getSeqno();

  const transaction = createJettonTransfer(
    seqno,
    wallet,
    address,
    jettonWalletAddress,
    state,
    jetton,
    secretKey
  );

  await tonContract.send(transaction);

  return seqno;
};

export const useSendJetton = (jetton: JettonAsset, state: SendJettonState) => {
  const tonClient = useContext(TonClientContext);
  const wallet = useContext(WalletStateContext);

  return useMutation<
    number,
    Error,
    { balance: string; jettonWalletAddress: Address; address: string }
  >(async ({ balance, jettonWalletAddress, address }) => {
    if (wallet.ledger) {
      return sendLedgerTransaction(
        tonClient,
        wallet,
        jetton,
        state,
        balance,
        jettonWalletAddress,
        address
      );
    } else {
      return sendMnemonicTransaction(
        tonClient,
        wallet,
        jetton,
        state,
        balance,
        jettonWalletAddress,
        address
      );
    }
  });
};
