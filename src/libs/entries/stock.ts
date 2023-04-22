export interface AppStock {
  dex: string;
  symbol: string;
  url?: string;
  price: string;
}

export type AppStocks = {
  [key: string]: AppStock;
};

export type DexStocks = {
  dedust: AppStocks;
  ston: AppStocks;
};
