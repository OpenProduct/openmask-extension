import { FC } from "react";
import { Asset } from "../../components/Asset";
import { TonIcon } from "../../components/Icons";

export const Assets: FC<{ balance?: string; price?: number }> = ({
  balance,
  price,
}) => {
  return (
    <>
      <Asset name="TON" logo={<TonIcon />} balance={balance} price={price} />
    </>
  );
};
