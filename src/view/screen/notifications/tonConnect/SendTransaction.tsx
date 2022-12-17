import { FC, useState } from "react";
import { TonConnectTransactionPayload } from "../../../../libs/entries/notificationMessage";
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
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { Dots } from "../../../components/Dots";
import { askBackground, sendBackground } from "../../../event";
import { useKeyPairMutation, useSendMutation } from "./api";

const timeout = 60 * 1000; // 60 sec

export const ConnectSendTransaction: FC<
  NotificationFields<"tonConnectSend", TonConnectTransactionPayload> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, onClose, data }) => {
  const [status, setStatus] = useState("");
  const [isSending, setSending] = useState(false);

  const { mutateAsync: getKeyPair, error: keyPairError } = useKeyPairMutation();
  const { mutateAsync, reset, error: sendError } = useSendMutation();

  const onCancel = () => {
    sendBackground.message("rejectRequest", id);
    onClose();
  };

  const onConfirm = async () => {
    setSending(true);
    try {
      const keyPair = await getKeyPair();
      setStatus(`keyPair`);
      for (let state of data.messages) {
        reset();
        const send = await mutateAsync({ state, keyPair });
        setStatus(`send ${JSON.stringify(state)}`);
        await send.method.send();
        await askBackground<void>(timeout).message("confirmSeqNo", send.seqno);
        setStatus(`confirm ${send.seqno}`);
        await delay(1000);
      }

      sendBackground.message("approveRequest", { id, payload: "success" });
      onClose();
    } catch (e) {
      setSending(false);
    }
  };

  const disabledCancel = isSending;
  const disabledConfig = isSending;
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

      {status && <ErrorMessage>{status}</ErrorMessage>}
      {sendError && <ErrorMessage>{sendError.message}</ErrorMessage>}
      {keyPairError && <ErrorMessage>{keyPairError.message}</ErrorMessage>}

      <Gap />

      <ButtonRow>
        <ButtonNegative onClick={onCancel} disabled={disabledCancel}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onConfirm} disabled={disabledConfig}>
          {isSending ? <Dots>Sending</Dots> : "Confirm"}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
