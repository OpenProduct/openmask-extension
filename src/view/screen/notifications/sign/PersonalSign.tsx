import { FC, useCallback } from "react";
import { RawSignInputParams } from "../../../../libs/entries/notificationMessage";
import { NotificationFields } from "../../../../libs/event";
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
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { sendBackground } from "../../../event";
import { usePersonalSignMutation } from "./api";

export const SignPersonal: FC<
  NotificationFields<"personalSign", RawSignInputParams> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, data, onClose }) => {
  const {
    mutateAsync,
    isLoading,
    error: rawSignError,
  } = usePersonalSignMutation();

  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
    onClose();
  }, [id]);

  const onSign = async () => {
    const signature = await mutateAsync(data.data);
    sendBackground.message("approveRequest", { id, payload: signature });
    onClose();
  };

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Personal Sign</H1>
        <Text>Would you like to sign data?</Text>
      </Center>

      <CodeBlock label="Message">{data.data}</CodeBlock>

      {rawSignError && <ErrorMessage>{rawSignError.message}</ErrorMessage>}

      <Gap />
      <ButtonRow>
        <ButtonNegative onClick={onBack} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onSign} disabled={isLoading}>
          Sign
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
