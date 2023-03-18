import React, { FC, useContext } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { NftItem } from "../../../../../../../libs/entries/asset";
import { SendNftState } from "../../../../../../../libs/service/transfer/nftService";
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
import { toSendNftState, useEstimateNftFee, useSendNft } from "./api";

const EditButton = React.memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const onEdit = () => {
    const state = toSendNftState(searchParams);
    setSearchParams({ ...state }); // Remove submit flag from params
  };
  return <SendEditButton onEdit={onEdit} />;
});

const Quote = styled.div`
  margin-bottom: ${(props) => props.theme.padding};
`;

interface ConfirmProps {
  nft: NftItem;
  state: SendNftState;
  balance?: string;
  onSend: (seqNo: number) => void;
}

export const SendNftConfirm: FC<ConfirmProps> = ({ nft, state, onSend }) => {
  const wallet = useContext(WalletStateContext);

  const {
    data: address,
    error: addressError,
    isFetching: isAddressFetching,
  } = useTargetAddress(state.address);

  const { data } = useEstimateNftFee(state, nft);

  const { mutateAsync, isLoading: isSending, error } = useSendNft(state, nft);
  const onConfirm = async () => {
    if (!address) return;
    const seqNo = await mutateAsync(address);
    onSend(seqNo);
  };

  const transaction = parseFloat(state.amount);

  const isLoading = isAddressFetching || isSending;
  const disabled = isLoading || error != null || addressError != null;

  return (
    <>
      <EditButton />
      <Body>
        <AddressTransfer left={wallet.name} right={state.address} />
        <TextLine>SENDING NFT:</TextLine>
        <TextLine>
          <b>{nft.state?.name ?? "Unknown"}</b>
        </TextLine>

        <Fees estimation={data} />
        <TextLine>Transaction fee estimation:</TextLine>
        <TextLine>
          Max: ~<b>{fiatFees.format(transaction)} TON*</b>
        </TextLine>
        <Quote>
          * The wallet sends an amount of TON to cover internal transaction and
          network storage costs. The rest of the TON that will not be used will
          be returned to the wallet.
        </Quote>

        {addressError && <ErrorMessage>{addressError.message}</ErrorMessage>}
        {error && <ErrorMessage>{error.message}</ErrorMessage>}

        <Gap />
        <ButtonRow>
          <SendCancelButton disabled={isLoading} homeRoute="../" />
          <ButtonPositive disabled={disabled} onClick={onConfirm}>
            {isAddressFetching ? (
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
