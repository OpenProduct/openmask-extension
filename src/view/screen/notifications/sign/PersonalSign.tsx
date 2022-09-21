import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
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
import { Loading } from "../../Loading";
import { useSignData, useSignMutation } from "./api";

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

export const SignPersonal = () => {
  const [searchParams] = useSearchParams();
  const origin = decodeURIComponent(searchParams.get("origin") ?? "");
  const logo = decodeURIComponent(searchParams.get("logo") ?? "");

  const id = parseInt(searchParams.get("id") ?? "0", 10);

  const { mutateAsync, isLoading, error: rawSignError } = useSignMutation();
  const { data, error, isFetching } = useSignData(id);

  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
  }, [id]);

  useEffect(() => {
    if (error) {
      onBack();
    }
  }, [error]);

  const onSign = async () => {
    const value = await mutateAsync(data);
    sendBackground.message("approveRequest", { id, payload: value });
  };

  if (isFetching) {
    return <Loading />;
  }

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Personal Sign</H1>
        <Text>Would you like to sign data?</Text>
      </Center>

      <Label>Message</Label>
      <RawData>{data}</RawData>

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
