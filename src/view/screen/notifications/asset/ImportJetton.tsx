import React, { FC, useCallback, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { JettonState } from "../../../../libs/entries/asset";
import {
  Body,
  ButtonBottomRow,
  ButtonNegative,
  ButtonPositive,
  Center,
  ErrorMessage,
  Gap,
  H1,
  Scroll,
  Text,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { JettonRow } from "../../../components/JettonRow";
import { sendBackground } from "../../../event";
import { toShortAddress } from "../../../utils";
import { Loading, NotificationView } from "../../Loading";
import {
  useAddJettonMutation,
  useJettonMinterData,
  useJettonWalletBalance,
  useOriginWallets,
} from "./api";

const Row = styled.div`
  display: inline-flex;
  gap: ${(props) => props.theme.padding};
  align-items: center;
  padding-bottom: ${(props) => props.theme.padding};
`;

const Font = styled.span`
  font-size: large;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface JettonWalletProps {
  wallet: string;
  id: number;
  state: JettonState;
  jettonMinterAddress: string;
}
const JettonWallet: FC<JettonWalletProps> = React.memo(
  ({ wallet, state, id, jettonMinterAddress }) => {
    const { data: jettonBallance } = useJettonWalletBalance(
      id,
      jettonMinterAddress,
      wallet
    );
    return (
      <>
        <Text>Wallet: {toShortAddress(wallet)}</Text>
        <JettonRow state={state} balance={jettonBallance} />
      </>
    );
  }
);

export const ImportJetton = () => {
  const [searchParams] = useSearchParams();
  const origin = decodeURIComponent(searchParams.get("origin") ?? "");
  const logo = decodeURIComponent(searchParams.get("logo") ?? "");
  const address = decodeURIComponent(searchParams.get("address") ?? "");

  const { data: wallets } = useOriginWallets(origin);

  const id = parseInt(searchParams.get("id") ?? "0", 10);

  const { data, isFetching, error } = useJettonMinterData(
    address,
    searchParams
  );

  const { mutate, isLoading, error: addError } = useAddJettonMutation(id);

  const onAdd = () => {
    if (!data) return;
    mutate({
      wallets,
      state: {
        state: data.state,
        minterAddress: address,
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
        <Text>Jetton (Your wallet balance)</Text>
      </Center>
      <Scroll>
        {(wallets ?? []).map((wallet) => (
          <JettonWallet
            wallet={wallet}
            id={id}
            state={data.state}
            jettonMinterAddress={address}
          />
        ))}
      </Scroll>
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
