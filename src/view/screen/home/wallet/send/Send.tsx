import { FC, useCallback, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import {
  Body,
  ButtonBottomRow,
  ButtonNegative,
  ButtonPositive,
  Center,
  Gap,
  H1,
  H3,
  Input,
  Text,
} from "../../../../components/Components";
import { LoadingLogo } from "../../../../components/Logo";
import { AppRoute } from "../../../../routes";

const CancelButton: FC<{ disabled?: boolean }> = ({ disabled }) => {
  const navigate = useNavigate();
  return (
    <ButtonNegative onClick={() => navigate(AppRoute.home)} disabled={disabled}>
      Cancel
    </ButtonNegative>
  );
};

const Block = styled.div`
  padding-bottom: ${(props) => props.theme.padding};
`;

const Label = styled.div`
  margin: ${(props) => props.theme.padding} 0 5px;
`;

const MaxRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: end;
`;

const MaxButton = styled.button`
  color: ${(props) => props.theme.darkBlue};
  text-decoration: underline;
  cursor: pointer;
  padding: 0 5px;
  background: ${(props) => props.theme.background};
  border: 0;
  outline: 0;
`;

enum SendRoutes {
  index = "/",
  confirm = "/confirm",
}

interface Props {
  price?: number;
  balance?: string;
}

interface State {
  address: string;
  amount: string;
  max: string;
  comment: string;
}

interface InputProps {
  balance?: string;
  state: State;
  onChange: (field: Partial<State>) => void;
  onSend: () => void;
}
const InputView: FC<InputProps> = ({ state, balance, onChange, onSend }) => {
  return (
    <Body>
      <H1>Send TON</H1>
      <Label>Enter wallet address</Label>
      <Input
        value={state.address}
        onChange={(e) => onChange({ address: e.target.value })}
      />

      <Label>Amount</Label>
      <Input
        type="number"
        value={state.amount}
        onChange={(e) => onChange({ amount: e.target.value, max: "0" })}
      />
      <MaxRow>
        <MaxButton onClick={() => onChange({ amount: balance, max: "1" })}>
          Max
        </MaxButton>
        {balance} TON
      </MaxRow>

      <Label>Comment (optional)</Label>
      <Input
        value={state.comment}
        onChange={(e) => onChange({ comment: e.target.value })}
      />

      <Gap />

      <ButtonBottomRow>
        <CancelButton />
        <ButtonPositive onClick={onSend}>Next</ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};

const Address = styled.span`
  word-break: break-all;
`;
interface ConfirmProps {
  state: State;
  onConfirm: () => void;
}

const ConfirmView: FC<ConfirmProps> = ({ state, onConfirm }) => {
  return (
    <Body>
      <H1>Send TON</H1>
      <Text>Send {state.amount} TON to</Text>
      <Text>
        <Address>{state.address}</Address>
      </Text>
      {state.comment && <Text>Comment: "{state.comment}"</Text>}

      <H3>Network fee estimation</H3>
      <Gap />

      <ButtonBottomRow>
        <CancelButton />
        <ButtonPositive onClick={onConfirm}>Confirm</ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};

const LoadingView = () => {
  return (
    <Body>
      <LoadingLogo />
      <Center>
        <Text>Await confirmation</Text>
        <span>~10 sec</span>
      </Center>
    </Body>
  );
};

export const Send: FC<Props> = ({ price, balance }) => {
  const [searchParams, setSearchParams] = useSearchParams({});

  const submit = searchParams.get("submit") === "1";

  const state = useMemo(() => {
    return {
      address: searchParams.get("address") ?? "",
      amount: searchParams.get("amount") ?? "",
      max: searchParams.get("max") ?? "",
      comment: searchParams.get("comment") ?? "",
    };
  }, [searchParams]);

  const onSend = useCallback(() => {
    setSearchParams({ ...state, submit: "1" });
  }, [setSearchParams, state]);

  const onChange = useCallback(
    (field: Partial<State>) => {
      setSearchParams({ ...state, ...field });
    },
    [setSearchParams, state]
  );

  const onConfirm = () => {};

  if (!submit) {
    return (
      <InputView
        state={state}
        onChange={onChange}
        onSend={onSend}
        balance={balance}
      />
    );
  }

  return <ConfirmView state={state} onConfirm={onConfirm} />;
};
