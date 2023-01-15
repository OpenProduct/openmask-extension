import {useContext} from "react";
import {WalletStateContext} from "../../../context";
import {useMutation} from "@tanstack/react-query";
import {getWalletKeyPair} from "../../api";
import nacl, {randomBytes} from "tweetnacl";
import {base64ToBytes, concatBytes} from "@openproduct/web-sdk";
import {decodeBase64, encodeBase64} from "tweetnacl-util";

type Options = {
  message?: string;
  receiverPublicKey?: string
}

const newNonce = () => randomBytes(nacl.box.nonceLength);
export const useEncryptMutation = () => {
  const wallet = useContext(WalletStateContext);

  return useMutation<string, Error, Options>(async (options) => {
    if (!options?.message) {
      throw new Error("Missing encrypt data");
    }

    const keyPair = await getWalletKeyPair(wallet);
    const nonce = newNonce();

    const messageAsButtes = base64ToBytes(options.message);
    const receiverPublicKey = options.receiverPublicKey ? base64ToBytes(options.receiverPublicKey) : keyPair.publicKey;
    const sharedKey = nacl.box.before(receiverPublicKey, keyPair.secretKey.slice(0, 32));

    const encrypted = nacl.box.after(
      messageAsButtes,
      nonce,
      sharedKey
    );


    if (!encrypted) {
      throw new Error(
        "Decryption error"
      );
    }

    return encodeBase64(concatBytes(nonce, encrypted));
  });
};
export const useDecryptMutation = () => {
  const wallet = useContext(WalletStateContext);

  return useMutation<string, Error, Options>(async (options) => {
    if (!options.message) {
      throw new Error("Missing decrypt data");
    }
    const keyPair = await getWalletKeyPair(wallet);

    const messageWithNonceAsUint8Array = decodeBase64(options.message);
    const nonce = messageWithNonceAsUint8Array.slice(0, nacl.box.nonceLength);

    const message = messageWithNonceAsUint8Array.slice(
      nacl.box.nonceLength,
      messageWithNonceAsUint8Array.length
    );
    const receiverPublicKey = options.receiverPublicKey ? base64ToBytes(options.receiverPublicKey) : keyPair.publicKey;
    const sharedKey = nacl.box.before(receiverPublicKey, keyPair.secretKey.slice(0, 32));

    const decrypted = nacl.box.open.after(
      message,
      nonce,
      sharedKey
    );

    if (!decrypted) {
      throw new Error(
        "Decryption error"
      );
    }

    return encodeBase64(decrypted);
  });
};
