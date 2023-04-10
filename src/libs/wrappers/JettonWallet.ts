import { Address, Cell, Contract, ContractProvider } from "ton-core";

export interface JettonWalletData {
  balance: bigint;
  ownerAddress: Address | null;
  jettonMinterAddress: Address | null;
  jettonWalletCode: Cell;
}

export class JettonWallet implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new JettonWallet(address);
  }

  async getData(provider: ContractProvider): Promise<JettonWalletData> {
    let res = await provider.get("get_wallet_data", []);

    const balance = res.stack.readBigNumber();
    const ownerAddress = res.stack.readAddress();
    const jettonMinterAddress = res.stack.readAddress();
    const jettonWalletCode = res.stack.readCell();

    return { balance, ownerAddress, jettonMinterAddress, jettonWalletCode };
  }
}
