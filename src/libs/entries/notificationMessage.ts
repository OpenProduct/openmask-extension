import Joi from "joi";

export interface DeployInputParams {
  workchain?: number;
  initDataCell: string;
  initCodeCell: string;
  initMessageCell?: string;
  amount: string;
}

export const DeployInputParamsSchema = Joi.object<DeployInputParams>({
  workchain: Joi.number().optional(),
  initDataCell: Joi.string().required(),
  initCodeCell: Joi.string().required(),
  initMessageCell: Joi.string().optional(),
  amount: Joi.string(),
});

export interface DeployOutputParams {
  walletSeqNo: number;
  newContractAddress: string;
}

export interface RawSignInputParams {
  data: string; // Cell boc hex
}

export interface SwitchNetworkParams {
  network: string;
}

export interface ConnectDAppParams {
  publicKey?: boolean;
}

export interface ConnectDAppPublicKey {
  address: string;
  version: "v2R1" | "v2R2" | "v3R1" | "v3R2" | "v4R1" | "v4R2";
  publicKey: string;
}

export type ConnectDAppOutputParams = (string | ConnectDAppPublicKey)[];

/**
 * Ton Connect
 */
export type TonConnectItem = TonAddressItem | TonProofItem;

export type TonAddressItem = {
  name: "ton_addr";
};

export type TonProofItem = {
  name: "ton_proof";
  payload: string; // arbitrary payload, e.g. nonce + expiration timestamp.
};

export type TonConnectRequest = {
  manifestUrl: string;
  return: "back" | "none" | string;
  items: TonConnectItem[]; // data items to share with the app
};

export type TonConnectItemReply = TonAddressItemReply | TonProofItemReply;

export enum TonConnectNETWORK {
  MAINNET = "-239",
  TESTNET = "-3",
}

export type TonAddressItemReply = {
  name: "ton_addr";
  address: string; // TON address raw (`0:<hex>`)
  network: TonConnectNETWORK; // network global_id
  walletStateInit: string; // Base64 (not url safe) encoded stateinit cell for the wallet contract
};

export type TonProofItemReply =
  | TonProofItemReplySuccess
  | TonProofItemReplyError;

export type TonProofItemReplySuccess = {
  name: "ton_proof";
  proof: {
    timestamp: string; // 64-bit unix epoch time of the signing operation (seconds)
    domain: {
      lengthBytes: number; // AppDomain Length
      value: string; // app domain name (as url part, without encoding)
    };
    signature: string; // base64-encoded signature
    payload: string; // payload from the request
  };
};

export type TonProofItemReplyError = {
  name: "ton_addr";
  error: {
    code: number;
    message?: string;
  };
};

export interface TonConnectTransactionPayload {
  valid_until: number; // 1658253458;
  messages: TonConnectTransactionPayloadMessage[];
}

export interface TonConnectTransactionPayloadMessage {
  address: string;
  amount: string;
  payload?: string;
  stateInit?: string;
}

// interface TonConnectTransactionPayload {
//   valid_until: 1658253458;
//   messages: [
//     {
//       address: "0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F";
//       amount: "20000000";
//       initState: "base64bocblahblahblah=="; //deploy contract
//     },
//     {
//       address: "0:E69F10CC84877ABF539F83F879291E5CA169451BA7BCE91A37A5CED3AB8080D3";
//       amount: "60000000";
//       payload: "base64bocblahblahblah=="; //transfer nft to new deployed account 0:412410771DA82CBA306A55FA9E0D43C9D245E38133CB58F1457DFB8D5CD8892F
//     }
//   ];
// }

/**
 * End of Ton Connect
 */
