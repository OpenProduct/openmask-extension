// import { WalletContract, WalletV3R2Source } from "ton";
import TonWeb from "tonweb";
import * as tonMnemonic from "tonweb-mnemonic";

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

// const ton = new TonWeb(new TonWeb.HttpProvider(this.isTestnet ? testnetRpc : mainnetRpc, {apiKey: IS_EXTENSION ? extensionApiKey : apiKey}));

const lastWalletVersion = "v4R2";

export const createWallet = async (ton: TonWeb) => {
  const mnemonic = await tonMnemonic.generateMnemonic();
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic);

  const WalletClass = ton.wallet.all[lastWalletVersion];
  const walletContract = new WalletClass(ton.provider, {
    publicKey: keyPair.publicKey,
    wc: 0,
  });
  const address = await walletContract.getAddress();
  return {
    name: "Account 1",
    mnemonic: mnemonic.join(" "),
    address: address.toString(true, true, true),
  };
};

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
