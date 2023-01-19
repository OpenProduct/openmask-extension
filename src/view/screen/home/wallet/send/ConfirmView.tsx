import { fromNano } from "@openproduct/web-sdk";
import React, { FC, useCallback, useContext } from "react";
import { URLSearchParamsInit, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { AddressTransfer } from "../../../../components/Address";
import { CodeBlock } from "../../../../components/CodeBlock";
import {
  Body,
  ButtonPositive,
  ButtonRow,
  ErrorMessage,
  Gap,
  TextLine,
} from "../../../../components/Components";
import { Dots } from "../../../../components/Dots";
import {
  SendCancelButton,
  SendEditButton,
} from "../../../../components/send/SendButtons";
import { WalletStateContext } from "../../../../context";
import { fiatFees } from "../../../../utils";
import {
  toState,
  TransactionState,
  useEstimateFee,
  useSendMethod,
  useSendMutation,
} from "./api";

const EditButton = React.memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const onEdit = () => {
    const state = toState(searchParams);
    setSearchParams({ ...state,
      isEncrypt: state.isEncrypt ? "1" : ""
    } as URLSearchParamsInit); // Remove submit flag from params
  };
  return <SendEditButton onEdit={onEdit} />;
});

const Fiat = styled.span`
  color: ${(props) => props.theme.darkGray};
`;

const Comment = styled.div`
  padding: 10px;
  background: ${(props) => props.theme.lightGray};
  font-size: medium;
  margin-bottom: ${(props) => props.theme.padding};
  word-break: break-all;
`;

interface ConfirmProps {
  state: TransactionState;
  price?: number;
  balance?: string;
  onSend: (seqNo: number) => void;
}

export const ConfirmView: FC<ConfirmProps> = ({
  state,
  balance,
  price,
  onSend,
}) => {
  const wallet = useContext(WalletStateContext);

  const {
    data: method,
    error: methodError,
    isFetching,
  } = useSendMethod(state, balance);
  const { data } = useEstimateFee(method);

  const { mutateAsync, error: sendError, isLoading } = useSendMutation();

  const onConfirm = async () => {
    if (!method) return;
    const seqNo = await mutateAsync(method);
    onSend(seqNo);
  };

  const Fees = useCallback(() => {
    if (!data) {
      return (
        <TextLine>
          <Dots>Loading</Dots>
        </TextLine>
      );
    }

    const totalTon = parseFloat(
      fromNano(
        String(data.fwd_fee + data.in_fwd_fee + data.storage_fee + data.gas_fee)
      )
    );

    const fiat = price ? `(USD ${fiatFees.format(totalTon * price)}$)` : "";

    return (
      <TextLine>
        ~<b>{fiatFees.format(totalTon)} TON</b> <Fiat>{fiat}</Fiat>
      </TextLine>
    );
  }, [data, price]);

  const inFiat = price
    ? ` (USD ${fiatFees.format(parseFloat(state.amount) * price)}$)`
    : "";

  const disabled =
    isLoading || isFetching || methodError != null || sendError != null;

  return (
    <>
      <EditButton />
      <Body>
        <AddressTransfer left={wallet.name} right={state.address} />
        <TextLine>SENDING:</TextLine>
        <TextLine>
          <b>{state.amount} TON</b> <Fiat>{inFiat}</Fiat>
        </TextLine>

        <TextLine>Network fee estimation:</TextLine>
        <Fees />

        {state.data && (
          <CodeBlock label="Comment">{String(state.data)}</CodeBlock>
        )}

        {methodError && <ErrorMessage>{methodError.message}</ErrorMessage>}
        {sendError && <ErrorMessage>{sendError.message}</ErrorMessage>}
        <Gap />

        <ButtonRow>
          <SendCancelButton disabled={isLoading} />
          <ButtonPositive disabled={disabled} onClick={onConfirm}>
            {isFetching ? <Dots>Validating</Dots> : "Confirm"}
          </ButtonPositive>
        </ButtonRow>
      </Body>
    </>
  );
};
