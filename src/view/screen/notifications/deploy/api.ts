import { Contract, TransferParams } from "@openmask/web-sdk";
import { Cell } from "@openmask/web-sdk/build/boc/cell";
import {
  Address,
  contractAddress,
  toNano,
} from "@openmask/web-sdk/build/utils";
import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import * as tonMnemonic from "tonweb-mnemonic";
import { SendMode } from "../../../../libs/entries/tonSendMode";
import { DeployParams } from "../../../../libs/event";
import { QueryType } from "../../../../libs/store/browserStore";
import {
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "../../../context";
import { decryptMnemonic } from "../../api";
import { WrapperMethod } from "../../home/wallet/send/api";
import { askBackgroundPassword } from "../../import/api";

export interface WrapperDeployMethod extends WrapperMethod {
  address: Address;
}

export const useDeployContractMutation = (params?: DeployParams) => {
  const contract = useContext(WalletContractContext);
  const wallet = useContext(WalletStateContext);
  const ton = useContext(TonProviderContext);

  return useQuery<WrapperDeployMethod, Error>(
    [QueryType.contract, "method", params],
    async () => {
      const { initDataCell, initCodeCell, initMessageCell, amount, workchain } =
        params!;

      const initialData = Cell.oneFromBoc(initDataCell);
      const initialCode = Cell.oneFromBoc(initCodeCell);

      const [newContractAddress, keyPair, seqno] = await Promise.all([
        contractAddress({
          workchain: workchain ?? 0,
          initialData,
          initialCode,
        }),
        (async () => {
          const mnemonic = await decryptMnemonic(
            wallet.mnemonic,
            await askBackgroundPassword()
          );
          return await tonMnemonic.mnemonicToKeyPair(mnemonic.split(" "));
        })(),
        ton.getSeqno(wallet.address),
      ] as const);

      const payload: TransferParams = {
        secretKey: keyPair.secretKey,
        toAddress: newContractAddress.toString(),
        amount: toNano(amount),
        seqno: seqno,
        sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
        payload: initMessageCell ? Cell.oneFromBoc(initMessageCell) : "",
        stateInit: Contract.createStateInit(initialCode, initialData),
      };

      const method = contract.transfer(payload);

      return { method, seqno, address: newContractAddress };
    },
    { enabled: params != null }
  );
};
