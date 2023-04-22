/**
 * Service methods to get dex stocks rates
 *
 * @author: KuznetsovNikita
 * @since: 0.14.6
 */

import BigNumber from "bignumber.js";
import { AppStocks } from "../entries/stock";
import {
  getCachedStoreValue,
  QueryType,
  setCachedStoreValue,
} from "../store/browserStore";

interface DeDustAssetMetadata {
  name: string; // "Toncoin",
  symbol: string; // "TON",
  image: string; // "https://assets.dedust.io/ton/images/ton.png",
  decimals: number; //9
}
interface DeDustNativeAsset {
  type: "native";
  address?: string;
  metadata: DeDustAssetMetadata | null;
}

interface DeDustJettonAsset {
  type: "jetton";
  address: string; // "EQAS2elYb6_hqWyOl7gpuYTzf1sqmjLJQ0lQ4X_4d_MvtMWR",
  metadata: DeDustAssetMetadata | null;
}

export type DeDustAsset = DeDustNativeAsset | DeDustJettonAsset;

interface DeDustItem {
  address: string; //"EQAeOyDl0k4gJ1DHNO8S58QTfUfswthRilI37CE-A5be2pUM",
  lt: string; // "37027667000009",
  totalSupply: string; //"160143257000001000",
  type: string; //"volatile",
  tradeFee: string; // "0.4",
  assets: [DeDustAsset, DeDustAsset];
  reserves: [string, string];
  stats: {
    fees: [string, string];
    volume: [string, string];
  };
}

export const getCachedDeDustStock = async (): Promise<AppStocks> => {
  try {
    let data = await getCachedStoreValue<AppStocks>(
      `${QueryType.stock}_dedust`
    );

    if (!data) {
      data = await getDeDustStock();
      await setCachedStoreValue(`${QueryType.stock}_dedust`, data);
    }

    return data;
  } catch (e) {
    return {};
  }
};

const getDeDustStock = async () => {
  const result = await fetch("https://api.dedust.io/v2/pools", {
    method: "GET",
  });

  const data: DeDustItem[] = await result.json();

  const defaultDecimals = 9;

  const stocks = data
    .filter((item) => {
      const [one] = item.assets;
      const [reserves] = item.reserves;
      return (
        one &&
        reserves &&
        one.type === "native" &&
        new BigNumber(reserves).isGreaterThanOrEqualTo(
          new BigNumber(500).shiftedBy(defaultDecimals)
        )
      );
    })
    .reduce((acc, item) => {
      const [ton, jetton] = item.assets;

      if (jetton.type !== "jetton") return acc;

      const [tonAmount, jettonAmount] = item.reserves;
      const tokenDecimals = jetton.metadata?.decimals || 9;

      const tonReserves = new BigNumber(tonAmount).shiftedBy(-defaultDecimals);
      const tokenReserves = new BigNumber(jettonAmount).shiftedBy(
        -tokenDecimals
      );
      const rate = tonReserves.div(tokenReserves).toString();

      acc[jetton.address] = {
        dex: "DeDust.io",
        url: jetton.address,
        symbol: jetton.address,
        price: rate, // in TON
      };

      return acc;
    }, {} as AppStocks);

  return stocks;
};
