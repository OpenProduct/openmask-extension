import { getSharedSecret } from "@noble/ed25519";
import { Address, beginCell, Builder, Cell } from "@ton/core";
import { TonClient } from "@ton/ton";
import nacl, { randomBytes } from "tweetnacl";
import { AnyWallet } from "./core";

export const getWalletPublicKey = async (
  tonClient: TonClient,
  address: string
): Promise<string> => {
  const contract = tonClient.open(
    AnyWallet.createFromAddress(Address.parse(address))
  );
  return await contract.getPublicKey();
};

function writeBuffer(src: Buffer, builder: Builder) {
  if (src.length > 0) {
    let bytes = Math.floor(builder.availableBits / 8);
    if (src.length > bytes) {
      let a = src.subarray(0, bytes);
      let t = src.subarray(bytes);
      builder = builder.storeBuffer(a);
      let bb = beginCell();
      writeBuffer(t, bb);
      builder = builder.storeRef(bb.endCell());
    } else {
      builder = builder.storeBuffer(src);
    }
  }
}

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
  const payload = Buffer.concat([nonce, encrypted]);

  let builder = beginCell().storeUint(1, 32);
  writeBuffer(payload, builder);
  return builder.endCell();
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
