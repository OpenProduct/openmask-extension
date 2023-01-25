import { getSharedSecret } from "@noble/ed25519";
import { base64ToBytes, bytesToHex, concatBytes } from "@openproduct/web-sdk";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import nacl, { randomBytes } from "tweetnacl";
import { decodeBase64, encodeBase64 } from "tweetnacl-util";
import {
  DecryptMessageInputParams,
  EncryptMessageInputParams,
} from "../../../../libs/entries/notificationMessage";
import { TonProviderContext, WalletStateContext } from "../../../context";
import { findContract } from "../../../utils";
import { getWalletKeyPair } from "../../api";
import {QueryType} from "../../../../libs/store/browserStore";

export const useGetAddress = (publicKey: string | undefined) => {
  const ton = useContext(TonProviderContext);
  const wallet = useContext(WalletStateContext);

  return useQuery<string>([publicKey, QueryType.publicKey], async () => {
    if (!publicKey) {
      return wallet.address;
    }
    const [_, address] = await findContract(ton, base64ToBytes(publicKey));

    return address.toString(true, true, true);
  });
};

export const useEncryptMutation = () => {
  const wallet = useContext(WalletStateContext);

  return useMutation<string, Error, EncryptMessageInputParams>(
    async (options) => {
      if (!options?.message) {
        throw new Error("Missing encrypt message");
      }

      const keyPair = await getWalletKeyPair(wallet);
      const nonce = randomBytes(nacl.box.nonceLength);

      const messageAsBytes = base64ToBytes(options.message);
      const receiverPublicKey = options.receiverPublicKey
        ? base64ToBytes(options.receiverPublicKey)
        : keyPair.publicKey;
      const sharedKey = await getSharedSecret(
        bytesToHex(keyPair.secretKey.slice(0, 32)),
        bytesToHex(receiverPublicKey)
      );

      const encrypted = nacl.box.after(messageAsBytes, nonce, sharedKey);

      if (!encrypted) {
        throw new Error("Encryption error");
      }

      return encodeBase64(concatBytes(nonce, encrypted));
    }
  );
};

export const useDecryptMutation = () => {
  const wallet = useContext(WalletStateContext);

  return useMutation<string, Error, DecryptMessageInputParams>(
    async (options) => {
      if (!options.message) {
        throw new Error("Missing decrypt message");
      }
      const keyPair = await getWalletKeyPair(wallet);

      const messageWithNonceAsUint8Array = decodeBase64(options.message);
      const nonce = messageWithNonceAsUint8Array.slice(0, nacl.box.nonceLength);

      const message = messageWithNonceAsUint8Array.slice(
        nacl.box.nonceLength,
        messageWithNonceAsUint8Array.length
      );

      const senderPublicKey = options.senderPublicKey
        ? base64ToBytes(options.senderPublicKey)
        : keyPair.publicKey;
      const sharedKey = await getSharedSecret(
        bytesToHex(keyPair.secretKey.slice(0, 32)),
        bytesToHex(senderPublicKey)
      );

      const decrypted = nacl.box.open.after(message, nonce, sharedKey);

      if (!decrypted) {
        throw new Error("Decryption error");
      }

      return encodeBase64(decrypted);
    }
  );
};
