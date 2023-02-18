import {
  TonClient,
  WalletContractV2R1,
  WalletContractV2R2,
  WalletContractV3R1,
  WalletContractV3R2,
  WalletContractV4,
} from "ton";

import { WalletState } from "./entries/wallet";

const workchain = 0;

export const getWalletContract = (wallet: WalletState) => {
  const publicKey = Buffer.from(wallet.publicKey, "hex");
  switch (wallet.version) {
    case "v2R1":
      return WalletContractV2R1.create({ workchain, publicKey });
    case "v2R2":
      return WalletContractV2R2.create({ workchain, publicKey });
    case "v3R1":
      return WalletContractV3R1.create({ workchain, publicKey });
    case "v3R2":
      return WalletContractV3R2.create({ workchain, publicKey });
    case "v4R1":
      throw new Error("Unsupported wallet contract version - v4R1");
    case "v4R2":
      return WalletContractV4.create({ workchain, publicKey });
  }
};

export const getSeqno = async (client: TonClient, wallet: WalletState) => {
  const contract = client.open(getWalletContract(wallet));
  return await contract.getSeqno();
};
