/**
 * Service methods to get dex stocks rates
 *
 * @author: KuznetsovNikita
 * @since: 0.14.6
 */

import { AppStocks } from "../entries/stock";
import {
  getCachedStoreValue,
  QueryType,
  setCachedStoreValue,
} from "../store/browserStore";

interface DeDustCMCItem {
  url: string; //"https://dedust.io/dex/swap?from=EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE&to=EQBPAVa6fjMigxsnHF33UQ3auufVrg2Z8lBZTY9R-isfjIFr",
  base_id: string; // "EQBlqsm144Dq6SjbPI4jjZvA1hqTIP3CvHovbIfW_t-SCALE",
  base_name: string; // "Scaleton",
  base_symbol: string; // "SCALE",
  quote_id: string; //"EQBPAVa6fjMigxsnHF33UQ3auufVrg2Z8lBZTY9R-isfjIFr",
  quote_name: string; // "Wrapped TON",
  quote_symbol: string; //"JTON",
  last_price: string; // "0.145870483",
  base_volume: string; //"1671670.536031563",
  quote_volume: string; //"226558.297595634"
}

interface DeDustCMC {
  [key: string]: DeDustCMCItem;
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
  const result = await fetch("https://api.dedust.io/cmc/dex", {
    method: "GET",
  });

  const data: DeDustCMC = await result.json();

  const stocks = Object.values(data).reduce((acc, item) => {
    if (item.quote_symbol === "JTON") {
      acc[item.base_symbol] = {
        dex: "DeDust.io",
        url: item.url,
        symbol: item.base_symbol,
        price: item.last_price, // in TON
      };
    }
    return acc;
  }, {} as AppStocks);

  stocks["JTON"] = {
    dex: "DeDust.io",
    symbol: "JTON",
    price: "1",
  };
  return stocks;
};
