import { FC } from "react";
import { useTransactions, Wallet } from "../../lib/state/wallet";

interface ActivitiesProps {
  wallet: Wallet;
  price?: number;
}

export const Activities: FC<ActivitiesProps> = ({ wallet, price }) => {
  const { data } = useTransactions(wallet);

  return <div>{JSON.stringify(data)}</div>;
};
