import { FC } from "react";
import styled from "styled-components";
import { DeployParams, NotificationFields } from "../../../../libs/event";
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

export const DeployContract: FC<
  NotificationFields<"deploy", DeployParams> & { onClose: () => void }
> = ({ id, logo, origin, data, onClose }) => {
  const onBack = () => {};
  const onDeploy = () => {};

  const isLoading = false;

  const rawSignError = null as Error | null;

  const Fees = () => {
    return <div></div>;
  };

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Deploy Smart Contract</H1>
        <Text>Would you like to deploy data?</Text>
      </Center>

      <TextLine>Network fee estimation:</TextLine>
      <Fees />
      <TextLine>Forward amount:</TextLine>
      <TextLine>
        <b>{data.amount} TON</b>
      </TextLine>

      <Label>Initial Code</Label>
      <RawData>{data.initCodeCell}</RawData>

      <Label>Initial Data</Label>
      <RawData>{data.initDataCell}</RawData>

      {data.initMessageCell && (
        <>
          <Label>Initial Message</Label>
          <RawData>{data.initMessageCell}</RawData>
        </>
      )}

      {rawSignError && <ErrorMessage>{rawSignError.message}</ErrorMessage>}

      <Gap />
      <ButtonRow>
        <ButtonNegative onClick={onBack} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onDeploy} disabled={isLoading}>
          Deploy
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
