import { useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  Body,
  ButtonBottomRow,
  ButtonNegative,
  ButtonPositive,
  Center,
  ErrorMessage,
  Gap,
  H1,
  Text,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { sendBackground } from "../../../event";
import { Loading } from "../../Loading";
import { useSignRawData, useSignRawMutation } from "./api";

const RawData = styled.div`
  padding: 10px;
  background: ${(props) => props.theme.lightGray};
  font-size: medium;
  margin-bottom: ${(props) => props.theme.padding};
  word-break: break-all;
`;

export const SignRaw = () => {
  const [searchParams] = useSearchParams();
  const origin = decodeURIComponent(searchParams.get("origin") ?? "");
  const logo = decodeURIComponent(searchParams.get("logo") ?? "");

  const id = parseInt(searchParams.get("id") ?? "0", 10);

  const { mutateAsync, isLoading, error: rawSignError } = useSignRawMutation();
  const { data, error, isFetching } = useSignRawData(id);

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
    sendBackground.message("signRaw", { id, value });
  };

  if (isFetching) {
    return <Loading />;
  }

  console.log(data);

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Raw Sign</H1>
        <Text>Would you like to sign raw data?</Text>
      </Center>

      <RawData>{data}</RawData>

      {rawSignError && <ErrorMessage>{rawSignError.message}</ErrorMessage>}

      <Gap />
      <ButtonBottomRow>
        <ButtonNegative onClick={onBack} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onSign} disabled={isLoading}>
          Sign
        </ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};
