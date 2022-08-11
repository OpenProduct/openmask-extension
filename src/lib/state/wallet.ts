import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import TonWeb from "tonweb";
import * as tonMnemonic from "tonweb-mnemonic";
import { WalletContract } from "tonweb/dist/types/contract/wallet/wallet-contract";
import { Address } from "tonweb/dist/types/utils/address";
import { QueryType, useNetwork } from ".";
import { useAccountState } from "./account";
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
    publicKey: TonWeb.utils.bytesToHex(keyPair.publicKey),
    version: lastWalletVersion,
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

export const useBalance = (wallet: Wallet) => {
  const { data: network } = useNetwork();

  return useQuery<string>(
    [network, wallet.state.address, QueryType.balance],
    async () => {
      const value = await wallet.contract.provider.getBalance(
        wallet.state.address
      );
      return balanceFormat.format(parseFloat(TonWeb.utils.fromNano(value)));
    }
  );
};

export const useAddress = (wallet: Wallet) => {
  const { data: network } = useNetwork();

  return useQuery<Address>(
    [network, wallet.state.address, QueryType.address],
    () => wallet.contract.getAddress()
  );
};
