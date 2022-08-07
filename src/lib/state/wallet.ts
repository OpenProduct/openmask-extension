// import { WalletContract, WalletV3R2Source } from "ton";
// import { KeyPair, mnemonicNew, mnemonicToWalletKey } from "ton-crypto";

// import { TonClient } from "ton";

// export const isTestnet = true;

// export const workchain = 0; // normally 0, only special contracts should be deployed to masterchain (-1)

// const endpoint = isTestnet
//   ? `https://testnet.toncenter.com/api/v2/jsonRPC`
//   : `https://toncenter.com/api/v2/jsonRPC`;

// export const toTonClient = () =>
//   new TonClient({
//     endpoint,
//     apiKey: process.env.TON_TONCENTER_APIKEY,
//   });

export interface WalletState {
  name?: string;
  mnemonic: string;
  address: string;
}

// export const toWalletContract = async (walletKey: KeyPair) => {
//   return WalletContract.create(
//     toTonClient(),
//     WalletV3R2Source.create({ publicKey: walletKey.publicKey, workchain })
//   );
// };

// export const initialWallet = async (): Promise<WalletState> => {
//   const mnemonic = await mnemonicNew(24);
//   const keys = await mnemonicToWalletKey(mnemonic);
//   const contract = await toWalletContract(keys);

//   return {
//     name: "Account 1",
//     mnemonic: mnemonic.join(" "),
//     address: contract.address.toFriendly(),
//   };
// };
