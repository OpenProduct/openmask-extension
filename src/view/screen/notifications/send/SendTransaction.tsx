import { FC, useContext } from "react";
import { TransactionParams } from "../../../../libs/entries/transaction";
import { NotificationFields } from "../../../../libs/event";
import { AddressTransfer } from "../../../components/Address";
import { CodeBlock } from "../../../components/CodeBlock";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Center,
  ErrorMessage,
  Gap,
  H1,
  Text,
  TextLine,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { Dots } from "../../../components/Dots";
import { Fees } from "../../../components/send/Fees";
import { WalletStateContext } from "../../../context";
import { sendBackground } from "../../../event";
import { useBalance } from "../../home/api";
import {
  useEstimateFee,
  useSendMethod,
  useSendMutation,
} from "../../home/wallet/send/api";
import { Loading } from "../../Loading";
import { useSendTransactionState } from "./api";

export const SendTransaction: FC<
  NotificationFields<"sendTransaction", TransactionParams> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, data, onClose }) => {
  const wallet = useContext(WalletStateContext);

  const { data: balance } = useBalance(wallet.address);
  const { data: state, isFetching: isPreValidating } =
    useSendTransactionState(data);

  const {
    data: method,
    error: methodError,
    isFetching: isPostValidating,
  } = useSendMethod(state, balance);

  const isValidating = isPreValidating || isPostValidating;

  const { data: estimation } = useEstimateFee(method);

  const {
    mutateAsync,
    error: sendError,
    isLoading: isSending,
  } = useSendMutation();

  const onBack = () => {
    sendBackground.message("rejectRequest", id);
    onClose();
  };

  const onConfirm = async () => {
    if (!method) return;
    const seqNo = await mutateAsync(method);

    sendBackground.message("approveRequest", {
      id,
      payload: seqNo,
    });

    onClose();
  };

  if (!state) {
    return <Loading />;
  }

  const loading = isValidating || isSending;

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Send Transaction</H1>
        <Text>Would you like to send transaction?</Text>
      </Center>

      <AddressTransfer left={wallet.name} right={data.to} />
      <TextLine>SENDING: ({origin})</TextLine>
      <TextLine>
        <b>{state.amount} TON</b>
      </TextLine>

      <Fees estimation={estimation} />

      {state.hex && <CodeBlock label="Payload">{state.hex}</CodeBlock>}

      {methodError && <ErrorMessage>{methodError.message}</ErrorMessage>}
      {sendError && <ErrorMessage>{sendError.message}</ErrorMessage>}

      <Gap />

      <ButtonRow>
        <ButtonNegative onClick={onBack} disabled={loading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive
          onClick={onConfirm}
          disabled={loading || methodError != null || sendError != null}
        >
          {isValidating ? (
            <Dots>Validating</Dots>
          ) : isSending ? (
            <Dots>Sending</Dots>
          ) : (
            "Confirm"
          )}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
