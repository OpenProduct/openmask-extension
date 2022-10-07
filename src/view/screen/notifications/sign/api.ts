import { bytesToHex, hexToBytes } from "@openmask/web-sdk/build/utils/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import nacl from "tweetnacl";
import { UnfinishedOperation } from "../../../../libs/event";
import { QueryType } from "../../../../libs/store/browserStore";
import { WalletStateContext } from "../../../context";
import { askBackground } from "../../../event";
import { getWalletKeyPair } from "../../api";

const timeout = 15;

export const useSignData = (id: number) => {
  return useQuery<string, Error>([QueryType.raw, id], async () => {
    const operation = await askBackground<UnfinishedOperation>(timeout).message(
      "getOperation"
    );

    if (!operation || operation.kind != "sign") {
      throw new Error("Missing sign data");
    }

    return operation.value;
  });
};

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
