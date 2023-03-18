import { ALL, hexToBytes, sha256_sync } from "@openproduct/web-sdk";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import { Address, Cell, fromNano, internal, SendMode, toNano } from "ton-core";
import { KeyPair } from "tonweb-mnemonic/dist/types";
import nacl from "tweetnacl";
import { selectNetworkConfig } from "../../../../libs/entries/network";
import {
  TonAddressItemReply,
  TonConnectItemReply,
  TonConnectRequest,
  TonConnectTransactionPayloadMessage,
  TonProofItemReplySuccess,
} from "../../../../libs/entries/notificationMessage";
import { Permission } from "../../../../libs/entries/permission";
import { WalletState } from "../../../../libs/entries/wallet";
import { getWalletContract } from "../../../../libs/service/transfer/core";
import { addDAppAccess } from "../../../../libs/state/connectionSerivce";
import {
  getConnections,
  setConnections,
} from "../../../../libs/store/browserStore";
import {
  AccountStateContext,
  NetworkContext,
  NetworksContext,
  TonClientContext,
  TonProviderContext,
  WalletStateContext,
} from "../../../context";
import { sendBackground } from "../../../event";
import { getWalletKeyPair } from "../../api";

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
  const ton = useContext(TonProviderContext);

  return useMutation<void, Error, ConnectParams>(
    async ({ origin, wallet, id, logo, data }) => {
      const currentNetwork = selectNetworkConfig(network, networks);
      const walletState = account.wallets.find(
        (item) => item.address === wallet
      );
      if (!walletState) {
        throw new Error("Unexpected wallet state");
      }

      const WalletClass = ALL[walletState.version];
      const walletContract = new WalletClass(ton, {
        publicKey: hexToBytes(walletState.publicKey),
        wc: 0,
      });

      const { stateInit, address } = await walletContract.createStateInit();

      const payload: TonConnectItemReply[] = [];
      for (let item of data.items) {
        if (item.name === "ton_addr") {
          const result: TonAddressItemReply = {
            name: "ton_addr",
            address: address.toString(false),
            network: currentNetwork.id,
            walletStateInit: stateInit.toBase64(),
          };
          payload.push(result);
        } else if (item.name === "ton_proof") {
          const proof = tonConnectProofPayload(
            origin,
            walletState.address,
            item.payload
          );

          if (walletState.isLadger) {
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

export const useKeyPairMutation = () => {
  const wallet = useContext(WalletStateContext);

  return useMutation<KeyPair, Error>(() => {
    return getWalletKeyPair(wallet);
  });
};

const toInit = (stateInit?: string) => {
  if (!stateInit) {
    return undefined;
  }
  const initSlice = Cell.fromBase64(stateInit).asSlice();
  return {
    code: initSlice.loadRef(),
    data: initSlice.loadRef(),
  };
};
export const useSendMutation = () => {
  const wallet = useContext(WalletStateContext);
  const client = useContext(TonClientContext);

  return useMutation<
    void,
    Error,
    { state: TonConnectTransactionPayloadMessage[]; keyPair: KeyPair }
  >(async ({ state, keyPair }) => {
    const walletContract = getWalletContract(wallet);
    const contract = client.open(walletContract);

    const seqno = await contract.getSeqno();

    const transfer = walletContract.createTransfer({
      secretKey: Buffer.from(keyPair.secretKey),
      seqno: seqno,
      sendMode: SendMode.PAY_GAS_SEPARATLY + SendMode.IGNORE_ERRORS,
      messages: state.map((item) => {
        return internal({
          to: item.address,
          value: toNano(fromNano(item.amount)),
          bounce: Address.isFriendly(item.address)
            ? Address.parseFriendly(item.address).isBounceable
            : false,
          init: toInit(item.stateInit),
          body: item.payload ? Cell.fromBase64(item.payload) : undefined,
        });
      }),
    });

    await client.sendExternalMessage(walletContract, transfer);
  });
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
