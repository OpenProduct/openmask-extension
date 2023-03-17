import { FC, useCallback, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { TransactionState } from "../../../../../libs/service/transfer/tonService";
import {
  Body,
  ButtonBottomRow,
  ButtonPositive,
  Gap,
  H1,
} from "../../../../components/Components";
import { InputField } from "../../../../components/InputField";
import { SendCancelButton } from "../../../../components/send/SendButtons";
import { SendLoadingView } from "../../../../components/send/SendLoadingView";
import { SendSuccessView } from "../../../../components/send/SendSuccessView";
import { WalletAddressContext, WalletStateContext } from "../../../../context";
import { sendBackground } from "../../../../event";
import { formatTonValue } from "../../../../utils";
import { stateToSearch, toState } from "./api";
import { ConfirmView } from "./ConfirmView";

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

interface Props {
  price?: number;
  balance?: string;
}

interface InputProps {
  balance?: string;
  state: TransactionState;
  onChange: (field: Partial<TransactionState>) => void;
  onSend: () => void;
}

const InputView: FC<InputProps> = ({ state, balance, onChange, onSend }) => {
  const wallet = useContext(WalletStateContext);

  const formatted = useMemo(() => {
    return balance ? formatTonValue(balance) : "-";
  }, [balance]);

  return (
    <Body>
      <H1>Send TON</H1>

      <InputField
        label="Enter wallet address"
        value={state.address}
        onChange={(e) => onChange({ address: e.target.value })}
      />

      <InputField
        label="Amount"
        type="number"
        value={state.amount}
        onChange={(e) => onChange({ amount: e.target.value, max: "0" })}
      />
      <MaxRow>
        <MaxButton
          onClick={() =>
            onChange({
              amount: balance ? formatTonValue(balance) : "0",
              max: "1",
            })
          }
        >
          Max
        </MaxButton>
        {formatted} TON
      </MaxRow>

      <InputField
        label="Comment (optional)"
        value={state.data as string}
        onChange={(e) => onChange({ data: e.target.value })}
      />

      {!wallet.isLadger && (
        <label>
          <input
            type="checkbox"
            checked={state.isEncrypt}
            onChange={(e) =>
              onChange({
                isEncrypt: e.target.checked,
              })
            }
          />
          Encrypt
        </label>
      )}

      <Gap />

      <ButtonBottomRow>
        <SendCancelButton />
        <ButtonPositive onClick={onSend}>Next</ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};

export const Send: FC<Props> = ({ price, balance }) => {
  const [searchParams, setSearchParams] = useSearchParams();

  const wallet = useContext(WalletStateContext);

  const seqNo = searchParams.get("seqNo");
  const confirm = searchParams.get("confirm");

  const submit = searchParams.get("submit") === "1";

  const state = useMemo(() => {
    return toState(searchParams);
  }, [searchParams]);

  const onSubmit = useCallback(() => {
    const params = { ...stateToSearch(state), submit: "1" };

    sendBackground.message("storeOperation", {
      kind: "send",
      value: { wallet: wallet.address, params },
    });

    setSearchParams(params);
  }, [setSearchParams, state]);

  const onChange = useCallback(
    (field: Partial<TransactionState>) => {
      const params = stateToSearch({ ...state, ...field });

      sendBackground.message("storeOperation", {
        kind: "send",
        value: { wallet: wallet.address, params },
      });

      setSearchParams(params);
    },
    [setSearchParams, state]
  );

  const onSend = useCallback(
    (seqNo: number) => {
      const params = { seqNo: String(seqNo) };
      sendBackground.message("storeOperation", null);
      setSearchParams(params);
    },
    [setSearchParams]
  );

  const onConfirm = useCallback(() => {
    sendBackground.message("storeOperation", null);

    setSearchParams({ confirm: String(seqNo) });
  }, [setSearchParams, seqNo]);

  const address = useContext(WalletAddressContext);

  if (confirm !== null) {
    return <SendSuccessView address={address} />;
  }

  if (seqNo !== null) {
    return (
      <SendLoadingView address={address} seqNo={seqNo} onConfirm={onConfirm} />
    );
  }

  if (!submit) {
    return (
      <InputView
        state={state}
        onChange={onChange}
        onSend={onSubmit}
        balance={balance}
      />
    );
  }

  return (
    <ConfirmView
      state={state}
      balance={balance}
      price={price}
      onSend={onSend}
    />
  );
};
