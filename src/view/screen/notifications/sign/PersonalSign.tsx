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
import { useSignMutation } from "./api";

export const SignPersonal: FC<
  NotificationFields<"personalSign", RawSignInputParams> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, data, onClose }) => {
  const { mutateAsync, isLoading, error: rawSignError } = useSignMutation();

  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
    onClose();
  }, [id]);

  const onSign = async () => {
    /**
     * According: https://github.com/ton-foundation/specs/blob/main/specs/wtf-0002.md
     */
    const hex = Buffer.concat([
      Buffer.from([0xff, 0xff]),
      Buffer.from("ton-safe-sign-magic"),
      Buffer.from(data.data, "utf8"),
    ]).toString("hex");

    const signature = await mutateAsync(hex);
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
