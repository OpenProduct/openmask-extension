import { EstimateFeeValues } from "@openproduct/web-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Address, Cell, fromNano } from "@ton/core";
import { TonClient } from "@ton/ton";
import { useContext } from "react";
import { DeployInputParams } from "../../../../libs/entries/notificationMessage";
import { WalletState } from "../../../../libs/entries/wallet";
import {
  getContractAddress,
  getWalletContract,
} from "../../../../libs/service/transfer/core";
import { validateAddressRestrictions } from "../../../../libs/service/transfer/restrictionService";
import {
  createLedgerTonTransfer,
  createTonTransfer,
} from "../../../../libs/service/transfer/tonService";
import { QueryType } from "../../../../libs/store/browserStore";
import { TonClientContext, WalletStateContext } from "../../../context";
import { checkBalanceOrDie2, getWalletKeyPair } from "../../api";
import { signLedgerTransaction } from "../../ledger/api";

interface DeployState {
  workchain: number;
  initialData: Cell;
  initialCode: Cell;
  initialMessage?: Cell;
  address: string;
  amount: string;
}

export const toDeployState = (
  params: DeployInputParams,
  network: string
): DeployState => {
  const { initDataCell, initCodeCell, workchain, amount, initMessageCell } =
    params;

  const [initialData] = Cell.fromBoc(Buffer.from(initDataCell, "hex"));
  const [initialCode] = Cell.fromBoc(Buffer.from(initCodeCell, "hex"));

  const address = getContractAddress({
    workchain: workchain ?? 0,
    data: initialData,
    code: initialCode,
  });

  return {
    workchain: workchain ?? 0,
    initialData,
    initialCode,
    address: address.toString({ testOnly: network === "testnet" }),
    amount: amount,
    initialMessage: initMessageCell
      ? Cell.fromBoc(Buffer.from(initMessageCell, "hex"))[0]
      : undefined,
  };
};

export const useEstimateDeploy = (state: DeployState) => {
  const tonClient = useContext(TonClientContext);
  const wallet = useContext(WalletStateContext);

  return useQuery([QueryType.estimation, state], async () => {
    const { address, initialCode, initialData, initialMessage, amount } = state;
    const transaction = createTonTransfer(
      0,
      wallet,
      address,
      { amount: fromNano(amount) },
      initialMessage,
      { code: initialCode, data: initialData }
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

const sendLedgerDeploy = async (
  tonClient: TonClient,
  wallet: WalletState,
  state: DeployState
) => {
  const contract = getWalletContract(wallet);
  const tonContract = tonClient.open(contract);

  const balance = await tonContract.getBalance();

  const { address, initialCode, initialData, initialMessage, amount } = state;
  checkBalanceOrDie2(balance.toString(), state.amount);

  const seqno = await tonContract.getSeqno();

  const transaction = createLedgerTonTransfer(
    seqno,
    address,
    { amount: fromNano(amount) },
    initialMessage,
    { code: initialCode, data: initialData }
  );

  const signed = await signLedgerTransaction(transaction);
  await tonContract.send(signed);

  return seqno;
};

const sendMnemonicDeploy = async (
  tonClient: TonClient,
  wallet: WalletState,
  state: DeployState
) => {
  await validateAddressRestrictions(state.address);
  const keyPair = await getWalletKeyPair(wallet);

  const secretKey = Buffer.from(keyPair.secretKey);

  const contract = getWalletContract(wallet);
  const tonContract = tonClient.open(contract);

  const balance = await tonContract.getBalance();

  const { address, initialCode, initialData, initialMessage, amount } = state;
  checkBalanceOrDie2(balance.toString(), amount);

  const seqno = await tonContract.getSeqno();

  const transaction = createTonTransfer(
    seqno,
    wallet,
    address,
    { amount: fromNano(amount) },
    initialMessage,
    { code: initialCode, data: initialData },
    secretKey
  );

  await tonContract.send(transaction);
  return seqno;
};

export const useSendDeploy = (state: DeployState) => {
  const tonClient = useContext(TonClientContext);
  const wallet = useContext(WalletStateContext);

  return useMutation<number, Error>(() => {
    if (wallet.ledger) {
      return sendLedgerDeploy(tonClient, wallet, state);
    } else {
      return sendMnemonicDeploy(tonClient, wallet, state);
    }
  });
};
