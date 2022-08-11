import { useQuery } from "@tanstack/react-query";
import TonWeb from "tonweb";
import * as tonMnemonic from "tonweb-mnemonic";
import { WalletContract } from "tonweb/dist/types/contract/wallet/wallet-contract";
import { Address } from "tonweb/dist/types/utils/address";
import { QueryType, useNetwork } from ".";
import { useTonProvider } from "./network";

export interface WalletState {
  name?: string;
  mnemonic: string;
  address: string;
  publicKey: string;
  version: keyof typeof TonWeb.Wallets.all;
}

const lastWalletVersion = "v4R2";

export const createWallet = async (ton: TonWeb): Promise<WalletState> => {
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
    address: address.toString(false),
    publicKey: Buffer.from(keyPair.publicKey).toString("utf-8"),
    version: lastWalletVersion,
  };
};

export const useWalletContract = (state: WalletState) => {
  const ton = useTonProvider();

  const WalletClass = ton.wallet.all[state.version];
  const walletContract = new WalletClass(ton.provider, {
    publicKey: new Uint8Array(Buffer.from(state.publicKey)),
    wc: 0,
  });

  return walletContract;
};

const balanceFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export const useBalance = (state: WalletState, contract: WalletContract) => {
  const { data: network } = useNetwork();

  return useQuery<string>(
    [network, state.address, QueryType.balance],
    async () => {
      const value = await contract.provider.getBalance(state.address);
      return balanceFormat.format(parseFloat(TonWeb.utils.fromNano(value)));
    }
  );
};

export const useAddress = (state: WalletState, contract: WalletContract) => {
  const { data: network } = useNetwork();

  return useQuery<Address>([network, state.address, QueryType.address], () =>
    contract.getAddress()
  );
};
