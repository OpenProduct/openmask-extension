import { fromNano } from "@openproduct/web-sdk";
import { useMemo } from "react";

const balanceFormat = new Intl.NumberFormat("en-US", {
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

const fiatFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
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
