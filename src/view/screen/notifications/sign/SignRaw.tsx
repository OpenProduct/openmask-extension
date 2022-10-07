import { FC, useCallback } from "react";
import styled from "styled-components";
import { RawSignInputParams } from "../../../../libs/entries/transactionMessage";
import { NotificationFields } from "../../../../libs/event";
import ExtensionPlatform from "../../../../libs/service/extension";
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

const Label = styled.div`
  margin: ${(props) => props.theme.padding} 0 5px;
`;

const RawData = styled.div`
  padding: 10px;
  background: ${(props) => props.theme.lightGray};
  font-size: medium;
  margin-bottom: ${(props) => props.theme.padding};
  word-break: break-all;
`;

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

      <Label>Message</Label>
      <RawData>{data.data}</RawData>

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
