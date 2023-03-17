import { FC, useState } from "react";
import styled from "styled-components";
import {
  TonConnectTransactionPayload,
  TonConnectTransactionPayloadMessage,
} from "../../../../libs/entries/notificationMessage";
import { NotificationFields } from "../../../../libs/event";
import { delay } from "../../../../libs/state/accountService";
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
import { CheckIcon, SpinnerIcon, TimeIcon } from "../../../components/Icons";
import { sendBackground } from "../../../event";
import { FingerprintLabel } from "../../../FingerprintLabel";
import { formatTonValue, toShortAddress } from "../../../utils";
import { useKeyPairMutation, useLastBocMutation, useSendMutation } from "./api";

interface PayloadMessage extends TonConnectTransactionPayloadMessage {
  isSend?: boolean;
  isConfirmed?: boolean;
}

const Row = styled.div`
  display: flex;
  gap: ${(props) => props.theme.padding};
  margin: 5px ${(props) => props.theme.padding};
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
  align-items: center;
`;

const Icon = styled.span`
  font-size: 200%;
`;

const Blue = styled.span`
  color: ${(props) => props.theme.blueTon};
`;

const TransactionItem: FC<{ message: PayloadMessage }> = ({ message }) => {
  return (
    <Row>
      <Icon>
        {message.isConfirmed ? (
          <Blue>
            <CheckIcon />
          </Blue>
        ) : message.isSend ? (
          <Blue>
            <SpinnerIcon />
          </Blue>
        ) : (
          <TimeIcon />
        )}
      </Icon>

      <div>
        <TextLine>SENDING:</TextLine>
        <TextLine>
          <b>{formatTonValue(String(message.amount))} TON</b> to{" "}
          {toShortAddress(message.address || "", 6)}
        </TextLine>
      </div>
    </Row>
  );
};

export const ConnectSendTransaction: FC<
  NotificationFields<"tonConnectSend", TonConnectTransactionPayload> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, onClose, data }) => {
  const [isSending, setSending] = useState(false);

  const [error, setError] = useState<Error | null>(null);
  const [items, setItems] = useState<PayloadMessage[]>(data.messages);

  const { mutateAsync: getKeyPair, error: keyPairError } = useKeyPairMutation();
  const { mutateAsync, reset, error: sendError } = useSendMutation();
  const { mutateAsync: getLastBoc } = useLastBocMutation();

  const onCancel = () => {
    sendBackground.message("rejectRequest", id);
    onClose();
  };

  const onConfirm = async () => {
    setSending(true);
    try {
      reset();
      const now = Date.now() / 1000;
      if (now > data.valid_until) {
        throw new Error("Transaction expired");
      }
      const keyPair = await getKeyPair();

      setItems((s) => s.map((item) => ({ ...item, isSend: true })));

      await mutateAsync({ state: items, keyPair });

      setItems((s) => s.map((item) => ({ ...item, isConfirmed: true })));

      const payload = await getLastBoc().catch(() => "");

      sendBackground.message("approveRequest", { id, payload });
      await delay(500);
      onClose();
    } catch (e) {
      setError(e as Error);
      setSending(false);
    }
  };

  const disabledCancel = isSending;
  const disabledConfirm = isSending || error != null;
  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>
          {data.messages.length > 1
            ? `Send ${data.messages.length} Transactions`
            : "Send Transaction"}
        </H1>
        <Text>Would you like to send transaction?</Text>
      </Center>

      {items.map((message, index) => (
        <TransactionItem key={index} message={message} />
      ))}

      {sendError && <ErrorMessage>{sendError.message}</ErrorMessage>}
      {keyPairError && <ErrorMessage>{keyPairError.message}</ErrorMessage>}
      {error && <ErrorMessage>{error.message}</ErrorMessage>}

      <Gap />

      <ButtonRow>
        <ButtonNegative onClick={onCancel} disabled={disabledCancel}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onConfirm} disabled={disabledConfirm}>
          {isSending ? (
            <Dots>Sending</Dots>
          ) : (
            <FingerprintLabel>Confirm</FingerprintLabel>
          )}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
