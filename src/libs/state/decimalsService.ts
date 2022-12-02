import BN from "bn.js";
const ethunit = require("ethjs-unit");

const map: Record<string, string> = {
  "1": "wei",
  "1000": "kwei",
  // "1000": "Kwei",
  // "1000": "babbage",
  // "1000": "femtoether",
  "1000000": "mwei",
  // "1000000": "Mwei",
  // "1000000": "lovelace",
  // "1000000": "picoether",
  "1000000000": "gwei",
  // "1000000000": "Gwei",
  //   "1000000000": "shannon",
  //   "1000000000": "nanoether",
  //   "1000000000": "nano",
  "1000000000000": "szabo",
  //   "1000000000000": "microether",
  //   "1000000000000": "micro",
  "1000000000000000": "finney",
  //   "1000000000000000": "milliether",
  //   "1000000000000000": "milli",
  "1000000000000000000": "ether",
  "1000000000000000000000": "kether",
  //   "1000000000000000000000": "grand",
  "1000000000000000000000000": "mether",
  "1000000000000000000000000000": "gether",
  "1000000000000000000000000000000": "tether",
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
