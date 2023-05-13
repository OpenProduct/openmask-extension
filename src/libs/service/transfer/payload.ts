import { getSharedSecret } from "@noble/ed25519";
import { Address, beginCell, Cell, TonClient } from "ton";
import nacl, { randomBytes } from "tweetnacl";
import { Wallet } from "./core";

export const getWalletPublicKey = async (
  tonClient: TonClient,
  address: Address
): Promise<string> => {
  const contract = tonClient.open(Wallet.createFromAddress(address));
  return await contract.getPublicKey();
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
  if (data === undefined) {
    return undefined;
  }
  if (!isEncrypt) {
    return data;
  }

  if (typeof data !== "string") {
    return data;
  }

  const target = Address.parse(address);
  const deployed = await tonClient.isContractDeployed(target);
  if (!deployed) {
    throw new Error("Missing target contract public key");
  }

  const receiverPublicKey = await getWalletPublicKey(tonClient, target);

  const sharedKey = await getSharedSecret(
    Buffer.alloc(32).toString("hex"),
    receiverPublicKey
  );
  const nonce = randomBytes(nacl.box.nonceLength);
  const encrypted = nacl.box.after(
    new TextEncoder().encode(data),
    nonce,
    sharedKey
  );

  if (!encrypted) {
    throw new Error("Encryption error");
  }
  const payload = Buffer.concat([Buffer.from(nonce), Buffer.from(encrypted)]);
  return beginCell().storeBuffer(payload).endCell();
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
  if (!isEncrypt) {
    return data;
  }

  if (typeof data !== "string") {
    return data;
  }

  const target = Address.parse(address);
  const deployed = await tonClient.isContractDeployed(target);
  if (!deployed) {
    throw new Error("Missing target contract public key");
  }

  const receiverPublicKey = await getWalletPublicKey(tonClient, target);

  const sharedKey = await getSharedSecret(
    secretKey.subarray(0, 32).toString("hex"),
    receiverPublicKey
  );
  const nonce = randomBytes(nacl.box.nonceLength);
  const encrypted = nacl.box.after(
    new TextEncoder().encode(data),
    nonce,
    sharedKey
  );

  if (!encrypted) {
    throw new Error("Encryption error");
  }
  const payload = Buffer.concat([Buffer.from(nonce), Buffer.from(encrypted)]);
  return beginCell().storeBuffer(payload).endCell();
};
