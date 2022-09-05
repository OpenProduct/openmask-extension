import React, { FC, useCallback, useContext } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Container,
  ErrorMessage,
  Gap,
  Text,
} from "../../../../components/Components";
import { Dots } from "../../../../components/Dots";
import { ArrowRightIcon, BackIcon } from "../../../../components/Icons";
import { WalletStateContext } from "../../../../context";
import { sendBackground } from "../../../../event";
import { AppRoute } from "../../../../routes";
import { toShortAddress, toShortName } from "../../../api";
import {
  State,
  toState,
  useEstimateFee,
  useMethod,
  useSendMutation,
} from "./api";

const Block = styled(Container)`
  width: 100%;
`;

const Button = styled.div`
  cursor: pointer;
`;

const EditButton = React.memo(() => {
  const [searchParams, setSearchParams] = useSearchParams();
  const state = toState(searchParams);
  const onEdit = () => {
    setSearchParams({ ...state });
  };
  return (
    <Block>
      <Button onClick={onEdit}>
        <BackIcon /> Edit
      </Button>
    </Block>
  );
});

export const CancelButton: FC<{
  disabled?: boolean;
  transactionId?: string;
}> = ({ disabled, transactionId }) => {
  const navigate = useNavigate();
  const onCancel = () => {
    if (transactionId) {
      sendBackground.message("rejectRequest", Number(transactionId));
    }
    navigate(AppRoute.home);
  };
  return (
    <ButtonNegative onClick={onCancel} disabled={disabled}>
      Cancel
    </ButtonNegative>
  );
};

const TextLine = styled(Text)`
  word-break: break-all;
`;

const Address = styled.div`
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.padding};
  font-size: medium;
  border: 1px solid ${(props) => props.theme.darkGray};
`;

const Icon = styled.span`
  font-size: large;
`;

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
  state: State;
  price?: number;
  balance?: string;
  onSend: (seqNo: number, transactionId?: string) => void;
}

const fiatFees = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 4,
});

export const ConfirmView: FC<ConfirmProps> = ({
  state,
  balance,
  price,
  onSend,
}) => {
  const { data: method, error, isFetching } = useMethod(state, balance);
  const { data } = useEstimateFee(method);

  const { mutateAsync, isLoading } = useSendMutation();

  const onConfirm = async () => {
    if (!method) return;
    const seqNo = await mutateAsync(method);
    onSend(seqNo, state.id);
  };

  const Fees = useCallback(() => {
    if (!data) {
      return (
        <TextLine>
          Loading
          <Dots />
        </TextLine>
      );
    }
    const totalTon =
      (data.fwd_fee + data.in_fwd_fee + data.storage_fee + data.gas_fee) /
      1000000000;

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

  const wallet = useContext(WalletStateContext);

  const disabled = isLoading || isFetching || error != null;

  return (
    <>
      <EditButton />
      <Body>
        <Address>
          {toShortName(wallet.name)}
          <Icon>
            <ArrowRightIcon />
          </Icon>

          {toShortAddress(state.address)}
        </Address>
        <TextLine>SENDING:{state.origin ? ` (${state.origin})` : ""}</TextLine>
        <TextLine>
          <b>{state.amount} TON</b> <Fiat>{inFiat}</Fiat>
        </TextLine>
        {state.comment && (
          <>
            <TextLine>Comment:</TextLine>
            <Comment>{state.comment}</Comment>
          </>
        )}

        <TextLine>Network fee estimation:</TextLine>
        <Fees />
        {error && <ErrorMessage>{error.message}</ErrorMessage>}
        <Gap />

        <ButtonRow>
          <CancelButton disabled={isLoading} transactionId={state.id} />
          <ButtonPositive disabled={disabled} onClick={onConfirm}>
            {isFetching ? (
              <>
                Validating
                <Dots />
              </>
            ) : (
              "Confirm"
            )}
          </ButtonPositive>
        </ButtonRow>
      </Body>
    </>
  );
};
