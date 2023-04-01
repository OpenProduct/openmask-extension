import BigNumber from "bignumber.js";
import BN from "bn.js";

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
  return formatDecimals(
    amount.toString(),
    parseInt(String(decimals))
  ).toString();
};

export const toCoinValue = (
  amount: string | BN,
  decimals: number | string = 9
): string => {
  return new BigNumber(amount.toString())
    .multipliedBy(Math.pow(10, parseInt(String(decimals))))
    .toFixed(0);
};
