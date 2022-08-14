import { useQuery } from "@tanstack/react-query";
import { useContext } from "react";
import TonWeb from "tonweb";
import * as tonMnemonic from "tonweb-mnemonic";
import { Address } from "tonweb/dist/types/utils/address";
import { QueryType } from ".";
import {
  NetworkContext,
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "../../home/context";

type WalletVersion = keyof typeof TonWeb.Wallets.all;

export interface WalletState {
  name: string;
  mnemonic: string;
  address: string;
  publicKey: string;
  version: WalletVersion;
}

const lastWalletVersion = "v4R2";

export const createWallet = async (
  ton: TonWeb,
  index: number
): Promise<WalletState> => {
  const mnemonic = await tonMnemonic.generateMnemonic();
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic);

  const WalletClass = ton.wallet.all[lastWalletVersion];
  const walletContract = new WalletClass(ton.provider, {
    publicKey: keyPair.publicKey,
    wc: 0,
  });
  const address = await walletContract.getAddress();
  return {
    name: `Account ${index}`,
    mnemonic: mnemonic.join(" "),
    address: address.toString(false),
    publicKey: TonWeb.utils.bytesToHex(keyPair.publicKey),
    version: lastWalletVersion,
  };
};

const findContract = async (
  ton: TonWeb,
  keyPair: tonMnemonic.KeyPair
): Promise<[WalletVersion, Address]> => {
  for (let [version, WalletClass] of Object.entries(ton.wallet.all)) {
    const wallet = new WalletClass(ton.provider, {
      publicKey: keyPair.publicKey,
      wc: 0,
    });

    const walletAddress = await wallet.getAddress();
    const balance = await ton.provider.getBalance(walletAddress.toString());
    if (balance !== "0") {
      return [version, walletAddress] as [WalletVersion, Address];
    }
  }

  const WalletClass = ton.wallet.all[lastWalletVersion];
  const walletContract = new WalletClass(ton.provider, {
    publicKey: keyPair.publicKey,
    wc: 0,
  });
  const address = await walletContract.getAddress();
  return [lastWalletVersion, address];
};

export const importWallet = async (
  ton: TonWeb,
  mnemonic: string[],
  index: number
): Promise<WalletState> => {
  const keyPair = await tonMnemonic.mnemonicToKeyPair(mnemonic);
  const [version, address] = await findContract(ton, keyPair);
  return {
    name: `Account ${index}`,
    mnemonic: mnemonic.join(" "),
    address: address.toString(false),
    publicKey: TonWeb.utils.bytesToHex(keyPair.publicKey),
    version,
  };
};

const balanceFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export const formatTonValue = (value: string): string => {
  return balanceFormat.format(parseFloat(TonWeb.utils.fromNano(value)));
};

export const toShortAddress = (address: string): string => {
  return address.slice(0, 4) + "...." + address.slice(-4);
};

export const useBalance = (address: string) => {
  const network = useContext(NetworkContext);
  const ton = useContext(TonProviderContext);

  return useQuery<string>([network, address, QueryType.balance], async () => {
    const value = await ton.provider.getBalance(address);
    return formatTonValue(value);
  });
};

export const useAddress = () => {
  const network = useContext(NetworkContext);
  const wallet = useContext(WalletStateContext);
  const contract = useContext(WalletContractContext);

  return useQuery<Address>([network, wallet.address, QueryType.address], () =>
    contract.getAddress()
  );
};
