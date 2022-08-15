import { useQuery } from "@tanstack/react-query";
import { QueryType } from "./state";

const tonId = "the-open-network";
const currency = "usd";

export const useCoinPrice = (enabled: boolean) => {
  return useQuery<number>(
    [QueryType.price],
    async () => {
      const result = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tonId}&vs_currencies=${currency}`
      );

      const data = await result.json();
      return data[tonId][currency];
    },
    { enabled }
  );
};
