import { FC } from "react";
import { TransactionParams } from "../../../../libs/entries/transaction";
import { NotificationFields } from "../../../../libs/event";
import { Loading } from "../../Loading";
import { useSendTransactionState } from "./api";
import { SendNftTransaction } from "./SendNftTransaction";
import { SendPureTransaction } from "./SendPureTransaction";

export const SendTransaction: FC<
  NotificationFields<"sendTransaction", TransactionParams> & {
    onClose: () => void;
  }
> = ({ data, ...rest }) => {
  const { data: state, isFetching: isFetching } = useSendTransactionState(data);

  if (isFetching || !state) {
    return <Loading />;
  }

  switch (state.kind) {
    case "pure":
      return <SendPureTransaction {...rest} data={state} />;
    case "nft":
      return <SendNftTransaction {...rest} data={state} />;
  }
};
