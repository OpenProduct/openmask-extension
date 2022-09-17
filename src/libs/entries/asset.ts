export interface JettonParams {
  type: "jetton";
  // The address of the token contract
  address: string;
  // A ticker symbol or shorthand, up to 11 characters
  symbol?: string;
  // The number of token decimals
  decimals?: number;
  // A string url of the token logo
  image?: string;
}
