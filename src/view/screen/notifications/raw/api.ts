import { bytesToHex, hexToBytes } from "@openmask/web-sdk/build/utils/utils";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import * as tonMnemonic from "tonweb-mnemonic";
import nacl from "tweetnacl";
import { UnfinishedOperation } from "../../../../libs/event";
import { QueryType } from "../../../../libs/store/browserStore";
import { WalletStateContext } from "../../../context";
import { askBackground } from "../../../event";
import { decryptMnemonic } from "../../api";
import { askBackgroundPassword } from "../../import/api";

const timeout = 15;

export const useSignRawData = (id: number) => {
  return useQuery<string, Error>([QueryType.raw, id], async () => {
    const operation = await askBackground<UnfinishedOperation>(timeout).message(
      "getOperation"
    );

    if (!operation || operation.kind != "rawSing") {
      throw new Error("Missing rawSign data");
    }

    return operation.value;
  });
};

export const useSignRawMutation = () => {
  const wallet = useContext(WalletStateContext);

  return useMutation<string, Error, string | undefined>(async (hex) => {
    if (!hex) {
      throw new Error("Missing rawSign data");
    }

    const mnemonic = await decryptMnemonic(
      wallet.mnemonic,
      await askBackgroundPassword()
    );
    const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic.split(" "));

    const signature = nacl.sign.detached(hexToBytes(hex), keyPair.secretKey);
    return bytesToHex(signature);
  });
};
