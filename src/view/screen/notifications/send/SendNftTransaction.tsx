import { FC, useContext } from "react";
import { NotificationFields } from "../../../../libs/event";
import { WalletStateContext } from "../../../context";
import { NftTransactionState } from "./api";

export const SendNftTransaction: FC<
  NotificationFields<"sendTransaction", NftTransactionState> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, data: { state }, onClose }) => {
  const wallet = useContext(WalletStateContext);

  return <div>Send nft transaction</div>;
};
