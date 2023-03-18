import { FC, useContext, useMemo, useState } from "react";
import styled from "styled-components";
import { Cell } from "ton-core";
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
import { Fees } from "../../../components/send/Fees";
import { WalletStateContext } from "../../../context";
import { sendBackground } from "../../../event";
import { FingerprintLabel } from "../../../FingerprintLabel";
import { formatTonValue, toShortAddress } from "../../../utils";
import {
  useEstimateTransactions,
  useLastBocMutation,
  useSendMnemonicMutation,
} from "./api";

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
  const name = useMemo(() => {
    if (!message.payload) return;
    const cell = Cell.fromBase64(message.payload);
    const operation = cell.asSlice().loadUint(32);
    switch (operation) {
      case 0x5fcc3d14:
        return "NFT Transfer";
      case 0xf8a7ea5:
        return "Jetton Transfer";
      default:
        return undefined;
    }
  }, [message]);

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
        <TextLine>{name ?? "SENDING"}:</TextLine>
        <TextLine>
          <b>{formatTonValue(String(message.amount))} TON</b> to{" "}
          {toShortAddress(message.address || "", 6)}
        </TextLine>
      </div>
    </Row>
  );
};

const SendLadgerTransactions = () => {};

const SendMnemonicTransactions: FC<{
  data: TonConnectTransactionPayload;
  onCancel: () => void;
  onOk: (payload: string) => void;
}> = ({ data, onCancel, onOk }) => {
  const [isSending, setSending] = useState(false);

  const [items, setItems] = useState<PayloadMessage[]>(data.messages);
  const [error, setError] = useState<Error | null>(null);

  const { data: estimation } = useEstimateTransactions(data);

  const { mutateAsync, reset, error: sendError } = useSendMnemonicMutation();
  const { mutateAsync: getLastBoc } = useLastBocMutation();

  const onConfirm = async () => {
    setSending(true);
    try {
      reset();
      setItems((s) => s.map((item) => ({ ...item, isSend: true })));

      await mutateAsync(data);

      setItems((s) => s.map((item) => ({ ...item, isConfirmed: true })));

      const payload = await getLastBoc().catch(() => "");
      onOk(payload);
    } catch (e) {
      setError(e as Error);
      setSending(false);
    }
  };

  const disabledCancel = isSending;
  const disabledConfirm = isSending || error != null;

  return (
    <>
      {items.map((message, index) => (
        <TransactionItem key={index} message={message} />
      ))}
      {estimation && (
        <Row>
          <Fees estimation={estimation} />
        </Row>
      )}

      {sendError && <ErrorMessage>{sendError.message}</ErrorMessage>}
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
    </>
  );
};

export const ConnectSendTransaction: FC<
  NotificationFields<"tonConnectSend", TonConnectTransactionPayload> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, onClose, data }) => {
  const wallet = useContext(WalletStateContext);

  const onCancel = () => {
    sendBackground.message("rejectRequest", id);
    onClose();
  };

  const onOk = async (payload: string) => {
    sendBackground.message("approveRequest", { id, payload });
    await delay(500);
    onClose();
  };

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

      {wallet.isLadger ? (
        <div></div>
      ) : (
        <SendMnemonicTransactions data={data} onCancel={onCancel} onOk={onOk} />
      )}
    </Body>
  );
};
