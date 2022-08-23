import TonWeb from "tonweb";

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
