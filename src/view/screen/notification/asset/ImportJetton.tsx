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
import { Loading, NotificationView } from "../../Loading";
import {
  useAddJettonMutation,
  useJettonMinterData,
  useJettonWalletData,
} from "./api";

const Row = styled.div`
  display: inline-flex;
  gap: ${(props) => props.theme.padding};
  align-items: center;
`;

const Font = styled.span`
  font-size: large;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ImportJetton = () => {
  const [searchParams] = useSearchParams();
  const origin = decodeURIComponent(searchParams.get("origin") ?? "");
  const logo = decodeURIComponent(searchParams.get("logo") ?? "");
  const address = decodeURIComponent(searchParams.get("address") ?? "");

  const id = parseInt(searchParams.get("id") ?? "0", 10);

  const { data, isFetching, error } = useJettonMinterData(
    address,
    searchParams
  );

  const { data: jettonBallance } = useJettonWalletData(
    id,
    data?.jettonWalletAddress
  );

  const { mutate, isLoading, error: addError } = useAddJettonMutation();

  const onAdd = () => {
    if (!data) return;
    mutate({
      origin,
      state: {
        state: data.state,
        minterAddress: address,
        walletAddress: data.jettonWalletAddress?.toString(),
      },
    });
  };

  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
  }, [id]);

  useEffect(() => {
    if (!address) {
      onBack();
    }
  }, []);

  if (isFetching) {
    return <Loading />;
  }

  if (!data || error || addError) {
    return (
      <NotificationView button="Close" action={onBack}>
        <ErrorMessage>
          {error?.message || addError?.message || "Jetton Data is not define"}
        </ErrorMessage>
      </NotificationView>
    );
  }

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Add Suggested Token</H1>
        <Text>Would you like to import these jetton?</Text>
        <Text>Jetton (Balance)</Text>
      </Center>
      <Row>
        <img
          alt="Coin Logo"
          width="35px"
          height="35px"
          src={data.state.image}
        />
        <Font>
          {data.state.name} ({jettonBallance ?? 0} {data.state.symbol})
        </Font>
      </Row>
      <Gap />
      <ButtonBottomRow>
        <ButtonNegative onClick={onBack} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onAdd} disabled={isLoading}>
          Add Jetton
        </ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};
