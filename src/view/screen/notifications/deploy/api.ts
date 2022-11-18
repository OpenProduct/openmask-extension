import {
  Address,
  Cell,
  Contract,
  contractAddress,
  TransferParams,
} from "@openproduct/web-sdk";
import { useQuery } from "@tanstack/react-query";
import BN from "bn.js";
import { useContext } from "react";
import { DeployInputParams } from "../../../../libs/entries/notificationMessage";
import { SendMode } from "../../../../libs/entries/tonSendMode";
import { ErrorCode, RuntimeError } from "../../../../libs/exception";
import { QueryType } from "../../../../libs/store/browserStore";
import {
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "../../../context";
import { checkBalanceOrDie, getWalletKeyPair } from "../../api";
import { WrapperMethod } from "../../home/wallet/send/api";

export const toInitState = async (params: DeployInputParams) => {
  const { initDataCell, initCodeCell, workchain, amount, initMessageCell } =
    params;

  const initialData = Cell.oneFromBoc(initDataCell);
  const initialCode = Cell.oneFromBoc(initCodeCell);

  const address = await contractAddress({
    workchain: workchain ?? 0,
    initialData,
    initialCode,
  });

  return {
    workchain: workchain ?? 0,
    initialData,
    initialCode,
    address,
    amount: new BN(amount, 10),
    initialMessage: initMessageCell
      ? Cell.oneFromBoc(initMessageCell)
      : new Cell(),
  };
};

export const useSmartContractAddress = (params?: DeployInputParams) => {
  return useQuery<Address, Error>(
    [QueryType.method, "address", params],
    async () => {
      const { address } = await toInitState(params!);
      return address;
    },
    { enabled: params != null }
  );
};

export const useDeployContractMutation = (
  params?: DeployInputParams,
  balance?: string
) => {
  const contract = useContext(WalletContractContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);

  return useQuery<WrapperMethod, Error>(
    [QueryType.method, wallet.address, params],
    async () => {
      const {
        address: newContractAddress,
        initialData,
        initialCode,
        amount,
        initialMessage,
      } = await toInitState(params!);

      await checkBalanceOrDie(balance, amount);

      if (await ton.isContractDeployed(newContractAddress.toString())) {
        throw new RuntimeError(
          ErrorCode.unexpectedParams,
          "Smart Contract already deployed"
        );
      }

      const [keyPair, seqno] = await Promise.all([
        getWalletKeyPair(wallet),
        ton.getSeqno(wallet.address),
      ] as const);

      const payload: TransferParams = {
        secretKey: keyPair.secretKey,
        toAddress: newContractAddress.toString(),
        amount: amount,
        seqno: seqno,
        sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
        payload: initialMessage,
        stateInit: Contract.createStateInit(initialCode, initialData),
      };

      const method = contract.transfer(payload);

      return { method, seqno };
    },
    { enabled: params != null && balance != null, retry: 0 }
  );
};
