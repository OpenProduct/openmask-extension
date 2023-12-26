import { Address } from "@ton/core";
import { useMemo } from "react";
import { useNetwork } from "../view/api";

export const useNonBounceableAddress = (address: string) => {
  const { data: network } = useNetwork();
  return useMemo(() => {
    return Address.parse(address).toString({
      urlSafe: true,
      bounceable: false,
      testOnly: network == "testnet",
    });
  }, [network, address]);
};
