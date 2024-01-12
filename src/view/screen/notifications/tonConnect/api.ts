import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Address,
  beginCell,
  external,
  storeMessage,
  storeStateInit,
} from "@ton/core";
import { sha256_sync } from "@ton/crypto";
import BigNumber from "bignumber.js";
import { useContext } from "react";
import nacl from "tweetnacl";
import { selectNetworkConfig } from "../../../../libs/entries/network";
import {
  TonAddressItemReply,
  TonConnectItemReply,
  TonConnectRequest,
  TonConnectTransactionPayload,
  TonConnectTransactionPayloadMessage,
  TonProofItemReplySuccess,
} from "../../../../libs/entries/notificationMessage";
import { Permission } from "../../../../libs/entries/permission";
import { EstimateFeeValues } from "../../../../libs/entries/tonCenter";
import { WalletState } from "../../../../libs/entries/wallet";
import { getWalletContract } from "../../../../libs/service/transfer/core";
import { parseLedgerTransaction } from "../../../../libs/service/transfer/ledgerService";
import { validateTonConnectRestrictions } from "../../../../libs/service/transfer/restrictionService";
import { createTonConnectTransfer } from "../../../../libs/service/transfer/tonService";
import { addDAppAccess } from "../../../../libs/state/connectionSerivce";
import {
  QueryType,
  getConnections,
  setConnections,
} from "../../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  NetworksContext,
  TonClientContext,
  WalletStateContext,
} from "../../../context";
import { sendBackground } from "../../../event";
import { checkBalanceOrDie2, getWalletKeyPair } from "../../api";
import { signLedgerTransaction } from "../../ledger/api";

interface ConnectParams {
  origin: string;
  wallet: string;
  id: number;
  logo: string | null;
  data: TonConnectRequest;
}

interface ConnectProofPayload {
  timestamp: number;
  bufferToSign: Buffer;
  domainBuffer: Buffer;
  payload: string;
  origin: string;
}

const tonConnectProofPayload = (
  origin: string,
  wallet: string,
  payload: string
): ConnectProofPayload => {
  const timestamp = Math.round(Date.now() / 1000);
  const timestampBuffer = Buffer.allocUnsafe(8);
  timestampBuffer.writeBigInt64LE(BigInt(timestamp));

  const domainBuffer = Buffer.from(new URL(origin).host);
  const domainLengthBuffer = Buffer.allocUnsafe(4);
  domainLengthBuffer.writeInt32LE(domainBuffer.byteLength);

  const address = Address.parse(wallet);

  const addressWorkchainBuffer = Buffer.allocUnsafe(4);
  addressWorkchainBuffer.writeInt32BE(address.workChain);

  const addressBuffer = Buffer.concat([addressWorkchainBuffer, address.hash]);

  const messageBuffer = Buffer.concat([
    Buffer.from("ton-proof-item-v2/", "utf8"),
    addressBuffer,
    domainLengthBuffer,
    domainBuffer,
    timestampBuffer,
    Buffer.from(payload),
  ]);

  const bufferToSign = Buffer.concat([
    Buffer.from("ffff", "hex"),
    Buffer.from("ton-connect", "utf8"),
    Buffer.from(sha256_sync(messageBuffer)),
  ]);

  return {
    timestamp,
    bufferToSign,
    domainBuffer,
    payload,
    origin,
  };
};

const toTonProofItemReplySuccess = (
  proof: ConnectProofPayload,
  signature: Buffer
) => {
  const result: TonProofItemReplySuccess = {
    name: "ton_proof",
    proof: {
      timestamp: proof.timestamp, // 64-bit unix epoch time of the signing operation (seconds)
      domain: {
        lengthBytes: proof.domainBuffer.byteLength, // AppDomain Length
        value: proof.domainBuffer.toString("utf8"), // app domain name (as url part, without encoding)
      },
      signature: signature.toString("base64"), // base64-encoded signature
      payload: proof.payload, // payload from the request
    },
  };

  return result;
};

const tonConnectMnemonicSignature = async (
  proof: ConnectProofPayload,
  walletState: WalletState
): Promise<TonProofItemReplySuccess> => {
  const keyPair = await getWalletKeyPair(walletState);

  const signature = nacl.sign.detached(
    Buffer.from(sha256_sync(proof.bufferToSign)),
    keyPair.secretKey
  );

  return toTonProofItemReplySuccess(proof, Buffer.from(signature));
};

export const useAddConnectionMutation = () => {
  const network = useContext(NetworkContext);
  const networks = useContext(NetworksContext);
  const account = useContext(AccountStateContext);

  return useMutation<void, Error, ConnectParams>(
    async ({ origin, wallet, id, logo, data }) => {
      const currentNetwork = selectNetworkConfig(network, networks);
      const walletState = account.wallets.find(
        (item) => item.address === wallet
      );
      if (!walletState) {
        throw new Error("Unexpected wallet state");
      }

      const contract = getWalletContract(walletState);
      const stateInit = beginCell()
        .storeWritable(storeStateInit(contract.init))
        .endCell();

      const address = new Address(contract.workchain, stateInit.hash());

      const payload: TonConnectItemReply[] = [];
      for (let item of data.items) {
        if (item.name === "ton_addr") {
          const result: TonAddressItemReply = {
            name: "ton_addr",
            address: address.toRawString(),
            network: currentNetwork.id,
            walletStateInit: stateInit
              .toBoc({ idx: true, crc32: true })
              .toString("base64"),
          };
          payload.push(result);
        } else if (item.name === "ton_proof") {
          const proof = tonConnectProofPayload(
            origin,
            walletState.address,
            item.payload
          );

          if (walletState.ledger) {
            throw new Error("Not implemented");
          } else {
            payload.push(await tonConnectMnemonicSignature(proof, walletState));
          }
        }
      }

      const connections = await getConnections(network);

      addDAppAccess(connections, logo, origin, [wallet], [Permission.base]);

      await setConnections(connections, network);

      sendBackground.message("approveRequest", { id, payload });
    }
  );
};

export const useSendMnemonicMutation = (origin: string) => {
  const wallet = useContext(WalletStateContext);
  const client = useContext(TonClientContext);

  return useMutation<string, Error, TonConnectTransactionPayload>(
    async (data) => {
      const now = Date.now() / 1000;
      if (now > data.valid_until) {
        throw new Error("Transaction expired");
      }

      await validateTonConnectRestrictions(origin, data.messages);

      const keyPair = await getWalletKeyPair(wallet);
      const walletContract = getWalletContract(wallet);
      const contract = client.open(walletContract);

      const seqno = await contract.getSeqno();
      const balance = await contract.getBalance();

      const total = data.messages.reduce(
        (acc, item) => acc.plus(item.amount),
        new BigNumber("0")
      );
      await checkBalanceOrDie2(balance.toString(), total);

      const transfer = createTonConnectTransfer(
        wallet,
        seqno,
        data.messages,
        Buffer.from(keyPair.secretKey)
      );

      await contract.send(transfer);

      const externalMessage = beginCell()
        .storeWritable(
          storeMessage(
            external({
              to: contract.address,
              init: seqno === 0 ? contract.init : undefined,
              body: transfer,
            })
          )
        )
        .endCell()
        .toBoc({ idx: false })
        .toString("base64");

      return externalMessage;
    }
  );
};

export const useLastBocMutation = () => {
  const wallet = useContext(WalletStateContext);
  const client = useContext(TonClientContext);

  return useMutation(async () => {
    const [tx] = await client.getTransactions(Address.parse(wallet.address), {
      limit: 1,
    });
    return tx.stateUpdate.newHash.toString();
  });
};

export const useEstimateTransactions = (data: TonConnectTransactionPayload) => {
  const wallet = useContext(WalletStateContext);
  const client = useContext(TonClientContext);

  return useQuery([QueryType.estimation, data], async () => {
    const transfer = createTonConnectTransfer(wallet, 0, data.messages);

    const result = await client.estimateExternalMessageFee(
      Address.parse(wallet.address),
      {
        body: transfer,
        initCode: null,
        initData: null,
        ignoreSignature: true,
      }
    );
    return result.source_fees as EstimateFeeValues;
  });
};

export const useSendLedgerMutation = () => {
  const wallet = useContext(WalletStateContext);
  const client = useContext(TonClientContext);

  return useMutation<number, Error, TonConnectTransactionPayloadMessage>(
    async (item) => {
      const contract = getWalletContract(wallet);
      const tonContract = client.open(contract);

      const seqno = await tonContract.getSeqno();

      const transaction = parseLedgerTransaction(wallet, seqno, item);

      const signed = await signLedgerTransaction(transaction);
      await tonContract.send(signed);

      return seqno;
    }
  );
};
