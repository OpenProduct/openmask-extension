import { bytesToHex, hexToBytes } from "@openproduct/web-sdk";
import { useMutation } from "@tanstack/react-query";
import { useContext } from "react";
import nacl from "tweetnacl";
import { WalletStateContext } from "../../../context";
import { getWalletKeyPair } from "../../api";

export const useSignMutation = () => {
  const wallet = useContext(WalletStateContext);

  return useMutation<string, Error, string | undefined>(async (hex) => {
    if (!hex) {
      throw new Error("Missing sign data");
    }
    const keyPair = await getWalletKeyPair(wallet);
    const signature = nacl.sign.detached(hexToBytes(hex), keyPair.secretKey);
    return bytesToHex(signature);
  });
};

export const usePersonalSignMutation = () => {
  const wallet = useContext(WalletStateContext);

  return useMutation<string, Error, string | undefined>(async (value) => {
    if (!value) {
      throw new Error("Missing sign data");
    }

    const valueHash = nacl.hash(Buffer.from(value, "utf8"));
    /**
     * According: https://github.com/ton-foundation/specs/blob/main/specs/wtf-0002.md
     */

    if (valueHash.length + "ton-safe-sign-magic".length >= 127) {
      throw new Error("Too large personal message");
    }

    const hex = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      Buffer.from("ton-safe-sign-magic"),
      valueHash,
    ]).toString("hex");

    const keyPair = await getWalletKeyPair(wallet);
    const signature = nacl.sign.detached(hexToBytes(hex), keyPair.secretKey);
    return bytesToHex(signature);
  });
};
