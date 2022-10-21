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

export const toShortAddress = (address: string): string => {
  return address.slice(0, 4) + "...." + address.slice(-4);
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
