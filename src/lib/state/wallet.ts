import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import TonWeb from "tonweb";
import * as tonMnemonic from "tonweb-mnemonic";
import { WalletContract } from "tonweb/dist/types/contract/wallet/wallet-contract";
import { Address } from "tonweb/dist/types/utils/address";
import { QueryType, useNetwork } from ".";
import { useAccountState } from "./account";
import { useTonProvider } from "./network";

type WalletVersion = keyof typeof TonWeb.Wallets.all;

export interface WalletState {
  name?: string;
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

const useActiveWallet = () => {
  const { data } = useAccountState();
  return data?.wallets.find((i) => i.address === data.activeWallet)!;
};

export interface Wallet {
  state: WalletState;
  contract: WalletContract;
}

export const useWalletContract = () => {
  const ton = useTonProvider();
  const state = useActiveWallet();

  return useMemo(() => {
    const WalletClass = ton.wallet.all[state.version];
    const walletContract = new WalletClass(ton.provider, {
      publicKey: TonWeb.utils.hexToBytes(state.publicKey),
      wc: 0,
    });

    return {
      state,
      contract: walletContract,
    };
  }, [ton, state]);
};

const balanceFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export const useBalance = (address: string) => {
  const { data: network } = useNetwork();
  const ton = useTonProvider();

  return useQuery<string>([network, address, QueryType.balance], async () => {
    const value = await ton.provider.getBalance(address);
    return balanceFormat.format(parseFloat(TonWeb.utils.fromNano(value)));
  });
};

export const useAddress = (wallet: Wallet) => {
  const { data: network } = useNetwork();

  return useQuery<Address>(
    [network, wallet.state.address, QueryType.address],
    () => wallet.contract.getAddress()
  );
};

export const useTransactions = (wallet: Wallet, limit: number = 10) => {
  const { data: network } = useNetwork();

  return useQuery<any>(
    [network, wallet.state.address, QueryType.transactions],
    () => wallet.contract.provider.getTransactions(wallet.state.address, limit)
  );
};
