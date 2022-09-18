import { useContext } from "react";
import { ActivitiesList } from "../../../../components/ActivitiesList";
import { WalletAddressContext } from "../../../../context";
import { useTransactions } from "./api";

export const Activities = () => {
  const address = useContext(WalletAddressContext);
  const { data, isLoading } = useTransactions();

  return <ActivitiesList isLoading={isLoading} data={data} address={address} />;
};
