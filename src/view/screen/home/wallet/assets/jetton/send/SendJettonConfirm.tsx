import React, { FC, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { JettonAsset } from "../../../../../../../libs/entries/asset";
import { SendJettonState } from "../../../../../../../libs/service/transfer/jettonService";
import { AddressTransfer } from "../../../../../../components/Address";
import {
  Body,
  ButtonPositive,
  ButtonRow,
  ErrorMessage,
  Gap,
  TextLine,
} from "../../../../../../components/Components";
import { Dots } from "../../../../../../components/Dots";
import { Fees } from "../../../../../../components/send/Fees";
import {
  SendCancelButton,
  SendEditButton,
} from "../../../../../../components/send/SendButtons";
import { WalletStateContext } from "../../../../../../context";
import { FingerprintLabel } from "../../../../../../FingerprintLabel";
import { fiatFees } from "../../../../../../utils";
import { useTargetAddress } from "../../../send/api";
import {
  toSendJettonState,
  useEstimateJettonFee,
  useJettonWalletAddress,
  useSendJetton,
} from "./api";

const EditButton = React.memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const onEdit = () => {
    const state = toSendJettonState(searchParams);
    setSearchParams({ ...state }); // Remove submit flag from params
  };
  return <SendEditButton onEdit={onEdit} />;
});

const Quote = styled.div`
  margin-bottom: ${(props) => props.theme.padding};
`;

interface ConfirmProps {
  jetton: JettonAsset;
  state: SendJettonState;
  balance?: string;
  onSend: (seqNo: number, transactionId?: string) => void;
}

export const SendJettonConfirm: FC<ConfirmProps> = ({
  jetton,
  state,
  balance,
  onSend,
}) => {
  const wallet = useContext(WalletStateContext);

  const {
    data: address,
    error: addressError,
    isFetching: isAddressFetching,
  } = useTargetAddress(state.address);

  const {
    data: jettonWalletAddress,
    error: jettonError,
    isFetching: isJettonFetching,
  } = useJettonWalletAddress(jetton);
  const { data } = useEstimateJettonFee(jetton, state);

  const {
    mutateAsync,
    isLoading: isSending,
    error: sendError,
  } = useSendJetton(jetton, state);

  const onConfirm = async () => {
    if (!balance || !address || !jettonWalletAddress) return;
    const seqNo = await mutateAsync({ balance, address, jettonWalletAddress });
    onSend(seqNo);
  };

  const transaction =
    state.transactionAmount != "" ? parseFloat(state.transactionAmount) : 0.1;

  const isLoading = isAddressFetching || isSending || isJettonFetching;
  const disabled = isLoading || addressError != null || jettonError != null;

  return (
    <>
      <EditButton />
      <Body>
        <AddressTransfer left={wallet.name} right={state.address} />
        <TextLine>SENDING {jetton.state.symbol}:</TextLine>

        <TextLine>
          <b>
            {state.amount} {jetton.state.symbol}
          </b>
        </TextLine>
        <Fees estimation={data} />
        <TextLine>Transaction fee estimation:</TextLine>
        <TextLine>
          Max: ~<b>{fiatFees.format(transaction)} TON*</b>
        </TextLine>
        <Quote>
          * The wallet sends an amount of TON to cover internal transaction
          costs. The rest of the TON that will not be used will be returned to
          the wallet.
        </Quote>

        {addressError && <ErrorMessage>{addressError.message}</ErrorMessage>}
        {jettonError && <ErrorMessage>{jettonError.message}</ErrorMessage>}
        {sendError && <ErrorMessage>{sendError.message}</ErrorMessage>}

        <Gap />
        <ButtonRow>
          <SendCancelButton disabled={isLoading} homeRoute="../" />
          <ButtonPositive disabled={disabled} onClick={onConfirm}>
            {isAddressFetching || isJettonFetching ? (
              <Dots>Validating</Dots>
            ) : isSending ? (
              <Dots>Loading</Dots>
            ) : (
              <FingerprintLabel>Confirm</FingerprintLabel>
            )}
          </ButtonPositive>
        </ButtonRow>
      </Body>
    </>
  );
};
