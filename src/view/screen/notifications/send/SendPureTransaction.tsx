import { FC, useContext } from "react";
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
import { PureTransactionState } from "./api";

export const SendPureTransaction: FC<
  NotificationFields<"sendTransaction", PureTransactionState> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, data: { state }, onClose }) => {
  const wallet = useContext(WalletStateContext);

  const { data: balance } = useBalance(wallet.address);

  const {
    data: method,
    error: methodError,
    isFetching: isValidating,
  } = useSendMethod(state, balance);

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
  const loading = isValidating || isSending;

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Send Transaction</H1>
        <Text>Would you like to send transaction?</Text>
      </Center>

      <AddressTransfer left={wallet.name} right={state.address} />
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
