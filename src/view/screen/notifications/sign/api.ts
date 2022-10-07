import { bytesToHex, hexToBytes } from "@openmask/web-sdk/build/utils/utils";
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
