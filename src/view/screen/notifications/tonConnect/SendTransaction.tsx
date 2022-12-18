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
import { askBackground, sendBackground } from "../../../event";
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
          <b>{formatTonValue(message.amount)} TON</b> to{" "}
          {toShortAddress(message.address || "", 6)}
        </TextLine>
      </div>
    </Row>
  );
};

const timeout = 60 * 1000; // 60 sec

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
      const now = Date.now() / 1000;
      if (now > data.valid_until) {
        throw new Error("Transaction expired");
      }
      const keyPair = await getKeyPair();
      for (let state of items) {
        reset();
        const send = await mutateAsync({ state, keyPair });

        setItems((s) =>
          s.map((item) =>
            item === state ? (state = { ...state, isSend: true }) : item
          )
        );

        await send.method.send();
        await askBackground<void>(timeout).message("confirmSeqNo", send.seqno);

        setItems((s) =>
          s.map((item) =>
            item === state ? (state = { ...state, isConfirmed: true }) : item
          )
        );
      }

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
          {isSending ? <Dots>Sending</Dots> : "Confirm"}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
