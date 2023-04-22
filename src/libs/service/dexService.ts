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

const defaultDecimals = 9;
const minTonReverse = 500;

const getDeDustStock = async () => {
  const result = await fetch("https://api.dedust.io/v2/pools", {
    method: "GET",
  });

  const data: DeDustItem[] = await result.json();

  const stocks = data
    .filter((item) => {
      const [one] = item.assets;
      const [reserves] = item.reserves;
      return (
        one &&
        reserves &&
        one.type === "native" &&
        new BigNumber(reserves).isGreaterThanOrEqualTo(
          new BigNumber(minTonReverse).shiftedBy(defaultDecimals)
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

const StonFiTon = "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c";
const StonFiWton = "EQDQoc5M3Bh8eWFephi9bClhevelbZZvWhkqdo80XuY_0qXv";

export interface StonFiItem {
  address: string; //"EQCSqjXUUfo7txZVeIpiB5ObyJ_dBOOdtXQNBIwvjMefNpF0"
  apy_1d: string; //"0.010509024542116885"
  apy_7d: string; // "1.090410672685333"
  apy_30d: string; // "1.090410672685333"
  collected_token0_protocol_fee: string; //"309131"
  collected_token1_protocol_fee: string; // "111845809"
  deprecated: boolean; //false
  lp_fee: string; //"20"
  lp_total_supply: string; //"209838035"
  protocol_fee: string; // "10"
  protocol_fee_address: string; // "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
  ref_fee: string; // "10"
  reserve0: string; // "9998902465"
  reserve1: string; // "4489590433195"
  router_address: string; // "EQB3ncyBUTjZUA5EnFKR5_EnOMI9V1tTEAAPaiU71gc4TiUt"
  token0_address: string; // "EQB-MPwrd1G6WKNkLz_VnV6WqBDd142KMQv-g1O-8QUA3728"
  token1_address: string; // "EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c"
}

export interface StonFiAsset {
  contract_address: string; //"EQCcLAW537KnRg_aSPrnQJoyYjOZkzqYp6FVmRUvN1crSazV"
  decimals: number; //9
  default_symbol: boolean; //false
  deprecated: boolean; //false
  display_name: string; //"Ambra"
  image_url: string; //"https://asset.ston.fi/img/EQCcLAW537KnRg_aSPrnQJoyYjOZkzqYp6FVmRUvN1crSazV"
  kind: string; //"JETTON"
  symbol: string; //"AMBR"
}

export const getCachedStonFiStock = async (): Promise<AppStocks> => {
  try {
    let data = await getCachedStoreValue<AppStocks>(
      `${QueryType.stock}_ston_fi`
    );

    if (!data) {
      data = await geStonFiStock();
      await setCachedStoreValue(`${QueryType.stock}_ston_fi`, data);
    }

    return data;
  } catch (e) {
    return {};
  }
};

const geStonFiStock = async (): Promise<AppStocks> => {
  const assets = await fetch("https://app.ston.fi/rpc", {
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "asset.list",
    }),
    headers: { "content-type": "application/json" },
  });

  const result = await fetch("https://app.ston.fi/rpc", {
    method: "POST",
    body: JSON.stringify({
      jsonrpc: "2.0",
      id: Date.now(),
      method: "pool.list",
    }),
    headers: { "content-type": "application/json" },
  });

  const data: StonFiItem[] = (await result.json()).result.pools;
  const assetList: StonFiAsset[] = (await assets.json()).result.assets;

  const stocks = data.reduce((acc, item) => {
    let tonReverse: string | undefined = undefined;
    let jettonReverse: string | undefined = undefined;
    let jettonAddress: string | undefined = undefined;
    if (
      item.token1_address === StonFiTon ||
      item.token1_address === StonFiWton
    ) {
      tonReverse = item.reserve1;
      jettonReverse = item.reserve0;
      jettonAddress = item.token0_address;
    }
    if (
      item.token0_address === StonFiTon ||
      item.token0_address === StonFiWton
    ) {
      tonReverse = item.reserve0;
      jettonReverse = item.reserve1;
      jettonAddress = item.token1_address;
    }
    if (!tonReverse || !jettonReverse || !jettonAddress) return acc;

    if (
      new BigNumber(tonReverse).isLessThan(
        new BigNumber(minTonReverse).shiftedBy(defaultDecimals)
      )
    )
      return acc;

    const asset = assetList.find((a) => a.contract_address === jettonAddress);
    if (!asset) return acc;

    const tonReserves = new BigNumber(tonReverse).shiftedBy(-defaultDecimals);
    const tokenReserves = new BigNumber(jettonReverse).shiftedBy(
      -asset.decimals
    );
    const rate = tonReserves.div(tokenReserves).toString();

    acc[jettonAddress] = {
      dex: "ston.fi",
      url: jettonAddress,
      symbol: jettonAddress,
      price: rate, // in TON
    };

    return acc;
  }, {} as AppStocks);

  return stocks;
};
