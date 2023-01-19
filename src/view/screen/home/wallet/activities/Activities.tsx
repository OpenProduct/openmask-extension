import { useContext } from "react";
import { ActivitiesList } from "../../../../components/ActivitiesList";
import { WalletAddressContext } from "../../../../context";
import { useDecryptPayload, useTransactions } from "./api";

export const Activities = () => {
  const address = useContext(WalletAddressContext);
  const { data: transactions, isLoading } = useTransactions();

  const { data: transactionsWithDecryptPayload, isLoading: decrypting } = useDecryptPayload(transactions);

  return <ActivitiesList isLoading={isLoading || decrypting} data={transactionsWithDecryptPayload} address={address} />;
};
