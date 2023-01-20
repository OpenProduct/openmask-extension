import { Address, ALL, fromNano, TonHttpProvider } from "@openproduct/web-sdk";
import { useMemo } from "react";
import { WalletVersion } from "../libs/entries/wallet";

export const balanceFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export const numberTonValue = (value: string): number => {
  return parseFloat(fromNano(value));
};

export const formatTonValue = (value: string): string => {
  return balanceFormat.format(numberTonValue(value));
};

export const formatCoinValue = (value: string): string => {
  return balanceFormat.format(parseFloat(value));
};

export const toShortAddress = (address: string, length = 4): string => {
  return address.slice(0, length) + "...." + address.slice(-length);
};

export const toShortName = (name: string): string => {
  if (name.length > 15) {
    return name.slice(0, 15) + "...";
  }
  return name;
};

export const fiatFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
  style: "currency",
  currency: "USD",
});

export const useCoinFiat = (balance?: string, price?: number) => {
  return useMemo(() => {
    if (price && balance) {
      return `${fiatFormat.format(parseFloat(balance) * price)}`;
    } else {
      return undefined;
    }
  }, [price, balance]);
};

export const useTonFiat = (balance?: string, price?: number) => {
  return useMemo(() => {
    if (price && balance) {
      return `${fiatFormat.format(numberTonValue(balance) * price)}`;
    } else {
      return undefined;
    }
  }, [price, balance]);
};

export const fiatFees = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export const lastWalletVersion = "v4R2";

export const findContract = async (
  ton: TonHttpProvider,
  publicKey: Uint8Array,
): Promise<[WalletVersion, Address]> => {
  for (let [version, WalletClass] of Object.entries(ALL)) {
    const wallet = new WalletClass(ton, {
      publicKey,
      wc: 0,
    });

    const walletAddress = await wallet.getAddress();
    const balance = await ton.getBalance(walletAddress.toString());
    if (balance !== "0") {
      return [version, walletAddress] as [WalletVersion, Address];
    }
  }

  const WalletClass = ALL[lastWalletVersion];
  const walletContract = new WalletClass(ton, {
    publicKey,
    wc: 0,
  });
  const address = await walletContract.getAddress();
  return [lastWalletVersion, address];
};
