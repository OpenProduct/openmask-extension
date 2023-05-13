import { getSharedSecret } from "@noble/ed25519";
import { Address, beginCell, Cell, TonClient } from "ton";
import nacl, { randomBytes } from "tweetnacl";
import { AnyWallet } from "./core";

export const getWalletPublicKey = async (
  tonClient: TonClient,
  address: string
): Promise<string> => {
  const target = Address.parse(address);
  const deployed = await tonClient.isContractDeployed(target);
  if (!deployed) {
    throw new Error("Missing target contract public key");
  }

  const contract = tonClient.open(AnyWallet.createFromAddress(target));
  return await contract.getPublicKey();
};

const encryptedComment = (data: string, sharedKey: Uint8Array) => {
  const nonce = randomBytes(nacl.box.nonceLength);
  const encrypted = nacl.box.after(
    new TextEncoder().encode(data),
    nonce,
    sharedKey
  );

  if (!encrypted) {
    throw new Error("Encryption error");
  }
  const payload = Buffer.concat([nonce, encrypted]).toString();

  return beginCell().storeUint(1, 32).storeStringTail(payload).endCell();
};

export const getEstimatePayload = async (
  tonClient: TonClient,
  address: string,
  isEncrypt: boolean | undefined,
  data: string | Cell | undefined
): Promise<string | Cell | undefined> => {
  if (data === undefined || data === "") {
    return undefined;
  }
  if (!isEncrypt || typeof data !== "string") {
    return data;
  }

  const receiverPublicKey = await getWalletPublicKey(tonClient, address);
  const sharedKey = await getSharedSecret(
    Buffer.alloc(32).toString("hex"),
    receiverPublicKey
  );
  return encryptedComment(data, sharedKey);
};

export const getPayload = async (
  tonClient: TonClient,
  address: string,
  isEncrypt: boolean | undefined,
  data: string | Cell | undefined,
  secretKey: Buffer = Buffer.alloc(32)
): Promise<string | Cell | undefined> => {
  if (data === undefined || data === "") {
    return undefined;
  }
  if (!isEncrypt || typeof data !== "string") {
    return data;
  }

  const receiverPublicKey = await getWalletPublicKey(tonClient, address);
  const sharedKey = await getSharedSecret(
    secretKey.subarray(0, 32).toString("hex"),
    receiverPublicKey
  );
  return encryptedComment(data, sharedKey);
};
