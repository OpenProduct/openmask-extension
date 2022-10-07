import { FC, useCallback } from "react";
import { RawSignInputParams } from "../../../../libs/entries/notificationMessage";
import { NotificationFields } from "../../../../libs/event";
import ExtensionPlatform from "../../../../libs/service/extension";
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
  InlineLink,
  Text,
  WarningMessage,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { LinkIcon } from "../../../components/Icons";
import { sendBackground } from "../../../event";
import { useSignMutation } from "./api";

const onLink = () =>
  ExtensionPlatform.openTab({
    url: "https://consensys.net/blog/metamask/the-seal-of-approval-know-what-youre-consenting-to-with-permissions-and-approvals-in-metamask/",
  });

export const SignRaw: FC<
  NotificationFields<"rawSign", RawSignInputParams> & { onClose: () => void }
> = ({ id, logo, origin, data, onClose }) => {
  const { mutateAsync, isLoading, error: rawSignError } = useSignMutation();

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
        <H1>Raw Sign</H1>
        <Text>Would you like to sign raw data?</Text>
      </Center>

      <WarningMessage>
        Signing this message can be dangerous.
        <br />
        <br /> This signature could potentially perform any operation on your
        account's behalf, including granting complete control of your account
        and all of its assets to the requesting site. Only sign this message if
        you know what you're doing or completely trust the requesting site.{" "}
        <InlineLink onClick={onLink}>
          Learn more <LinkIcon />
        </InlineLink>
      </WarningMessage>

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
