import {
  WalletContractV2R1,
  WalletContractV2R2,
  WalletContractV3R1,
  WalletContractV3R2,
  WalletContractV4,
} from "ton";
import {
  Address,
  beginCell,
  Cell,
  Contract,
  ContractProvider,
  storeStateInit,
} from "ton-core";
import { WalletState } from "../../entries/wallet";

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

export function getContractAddress(source: {
  workchain: number;
  code: Cell;
  data: Cell;
}) {
  const cell = beginCell()
    .storeWritable(storeStateInit({ code: source.code, data: source.data }))
    .endCell();
  return new Address(source.workchain, cell.hash());
}

export const getWalletAddress = (wallet: WalletState, network: string) => {
  const contract = getWalletContract(wallet);
  const address = getContractAddress({
    workchain: contract.workchain,
    code: contract.init.code,
    data: contract.init.data,
  });
  return address.toString({
    urlSafe: true,
    bounceable: wallet.isBounceable,
    testOnly: network === "testnet",
  });
};

export class Wallet implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new Wallet(address);
  }

  async getSeqno(provider: ContractProvider): Promise<number> {
    let state = await provider.getState();
    if (state.state.type === "active") {
      let res = await provider.get("seqno", []);
      return res.stack.readNumber();
    } else {
      return 0;
    }
  }

  async getPublicKey(provider: ContractProvider): Promise<string> {
    let state = await provider.getState();

    if (state.state.type !== "active") {
      throw new Error(`Wallet is not deployed: ${state.state.type}`);
    }

    const res = await provider.get("get_public_key", []);
    const walletPubKeyBN = res.stack.readBigNumber();
    let walletPubKeyHex = walletPubKeyBN.toString(16);
    if (walletPubKeyHex.length % 2 !== 0) {
      walletPubKeyHex = "0" + walletPubKeyHex;
    }
    return walletPubKeyHex;
  }
}
