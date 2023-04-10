import { Address, beginCell, Cell, Contract, ContractProvider } from "ton-core";
import { JettonStateSchema } from "../entries/asset";
import { requestJson } from "../service/requestService";
import { readOnchainMetadata, readSnakeCell } from "../state/onchainContent";

const ONCHAIN_CONTENT_PREFIX = 0x00;

export interface JettonMinterData {
  name: string;
  symbol: string;
  description?: string;
  image?: string;
  decimals?: string;
}

export interface JettonContent {
  jettonContent: JettonMinterData | null;
}

export interface JettonData extends JettonContent {
  totalSupply: bigint;
  isMutable: boolean;
  adminAddress: Address | null;
  jettonContentCell: Cell;
  jettonWalletCode: Cell;
}

const getJettonNameState = async (jettonContentUri: string) => {
  let state: Partial<JettonMinterData> = {};

  if (jettonContentUri) {
    state = await requestJson<Partial<JettonMinterData>>(jettonContentUri);
  }
  if (state.name) {
    state.name = state.name.replace(/\0.*$/g, ""); // remove null bytes
  }
  if (state.decimals && typeof state.decimals == "number") {
    state.decimals = String(state.decimals);
  }

  return state;
};

const getJettonContent = async (jettonContentCell: Cell) => {
  try {
    const contentSlice = jettonContentCell.beginParse();
    const prefix = contentSlice.loadUint(8);

    if (prefix === ONCHAIN_CONTENT_PREFIX) {
      const { uri } = readOnchainMetadata<{ uri: string }>(jettonContentCell, [
        "uri",
      ]);

      const jettonContent = readOnchainMetadata<JettonMinterData>(
        jettonContentCell,
        ["name", "description", "image", "symbol", "decimals"]
      );

      if (uri) {
        const state = await getJettonNameState(uri);
        return await JettonStateSchema.validateAsync({
          ...state,
          ...jettonContent,
        });
      } else {
        return await JettonStateSchema.validateAsync(jettonContent);
      }
    } else {
      const content = readSnakeCell(jettonContentCell);
      if (content) {
        const state = await getJettonNameState(content.toString("utf8"));
        return await JettonStateSchema.validateAsync(state);
      } else {
        throw new Error("Unexpected jetton metadata content prefix");
      }
    }
  } catch (e) {
    return null;
  }
};

export class JettonMinter implements Contract {
  constructor(
    readonly address: Address,
    readonly init?: { code: Cell; data: Cell }
  ) {}

  static createFromAddress(address: Address) {
    return new JettonMinter(address);
  }

  async getJettonData(provider: ContractProvider): Promise<JettonData> {
    let res = await provider.get("get_jetton_data", []);

    const totalSupply = res.stack.readBigNumber();
    const isMutable = res.stack.readNumber() === -1;
    let adminAddress = null;
    try {
      adminAddress = res.stack.readAddress();
    } catch (e) {}
    const jettonContentCell = res.stack.readCell();
    const jettonWalletCode = res.stack.readCell();

    const jettonContent = await getJettonContent(jettonContentCell);

    return {
      totalSupply,
      isMutable,
      adminAddress,
      jettonContentCell,
      jettonWalletCode,
      jettonContent,
    };
  }

  async getJettonWalletAddress(
    provider: ContractProvider,
    wallet: Address
  ): Promise<Address> {
    let res = await provider.get("get_wallet_address", [
      { type: "slice", cell: beginCell().storeAddress(wallet).endCell() },
    ]);
    return res.stack.readAddress();
  }
}
