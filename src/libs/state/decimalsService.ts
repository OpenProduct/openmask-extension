import BigNumber from "bignumber.js";
import BN from "bn.js";
const ethunit = require("ethjs-unit");

const map: Record<string, string> = {
  "1": "wei",
  "1000": "kwei",
  "1000000": "mwei",
  "1000000000": "gwei",
  "1000000000000": "szabo",
  "1000000000000000": "finney",
  "1000000000000000000": "ether",
  "1000000000000000000000": "kether",
  "1000000000000000000000000": "mether",
  "1000000000000000000000000000": "gether",
  "1000000000000000000000000000000": "tether",
};

export const formatDecimals = (
  amount: BigNumber.Value,
  decimals: number = 9
): number => {
  return new BigNumber(amount).div(Math.pow(10, decimals)).toNumber();
};

export const formatAmountValue = (
  amount: BN | string,
  decimals: number | string = 9
): string => {
  if (!BN.isBN(amount) && !(typeof amount === "string")) {
    throw new Error(
      "Please pass numbers as strings or BN objects to avoid precision errors."
    );
  }

  const format = map[Math.pow(10, parseInt(String(decimals))).toString()];
  if (!format) {
    throw new Error("Unexpected format");
  }

  return ethunit.fromWei(amount, format);
};

export const toCoinValue = (
  amount: string | BN,
  decimals: number | string = 9
): BN => {
  if (!BN.isBN(amount) && !(typeof amount === "string")) {
    throw new Error(
      "Please pass numbers as strings or BN objects to avoid precision errors."
    );
  }

  const format = map[Math.pow(10, parseInt(String(decimals))).toString()];
  if (!format) {
    throw new Error("Unexpected format");
  }
  if (!BN.isBN(amount) && !(typeof amount === "string")) {
    throw new Error("Unexpected format");
  }
  return ethunit.toWei(amount, format);
};
