import { FC, useCallback, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { JettonState } from "../../../../../../../libs/entries/asset";
import {
  Body,
  ButtonBottomRow,
  ButtonPositive,
  Gap,
  H1,
  Input,
} from "../../../../../../components/Components";
import { SendCancelButton } from "../../../../../../components/send/SendButtons";
import { SendLoadingView } from "../../../../../../components/send/SendLoadingView";
import { SendSuccessView } from "../../../../../../components/send/SendSuccessView";
import { WalletAddressContext } from "../../../../../../context";
import { sendBackground } from "../../../../../../event";
import { useJettonWalletBalance } from "../../api";
import { JettonMinterAddressContext, JettonStateContext } from "../context";
import { SendJettonState, stateToSearch, toSendJettonState } from "./api";
import { SendJettonConfirm } from "./SendJettonConfirm";

const Label = styled.div`
  margin: ${(props) => props.theme.padding} 0 5px;
`;

interface InputProps {
  jetton: JettonState;
  state: SendJettonState;

  onChange: (field: Partial<SendJettonState>) => void;
  onSend: () => void;
}

const SendJettonInputView: FC<InputProps> = ({
  jetton,
  state,
  onChange,
  onSend,
}) => {
  return (
    <Body>
      <H1>Send {jetton.state.symbol}</H1>
      <Label>Enter wallet address</Label>
      <Input
        value={state.address}
        onChange={(e) => onChange({ address: e.target.value })}
      />

      <Label>Amount</Label>
      <Input
        type="number"
        value={state.amount}
        onChange={(e) => onChange({ amount: e.target.value })}
      />

      <Label>Comment (optional)</Label>
      <Input
        value={state.comment}
        onChange={(e) => onChange({ comment: e.target.value })}
      />

      <Gap />
      <ButtonBottomRow>
        <SendCancelButton transactionId={state.id} homeRoute="../" />
        <ButtonPositive onClick={onSend}>Next</ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};

export const JettonSend = () => {
  const address = useContext(WalletAddressContext);
  const minterAddress = useContext(JettonMinterAddressContext);
  const jetton = useContext(JettonStateContext);
  const [searchParams, setSearchParams] = useSearchParams();
  const { data: balance } = useJettonWalletBalance(jetton);

  const seqNo = searchParams.get("seqNo");
  const confirm = searchParams.get("confirm");

  const submit = searchParams.get("submit") === "1";

  const state = useMemo(() => {
    return toSendJettonState(searchParams);
  }, [searchParams]);

  const onSubmit = useCallback(() => {
    const params = { ...stateToSearch(state), submit: "1" };

    sendBackground.message("storeOperation", {
      kind: "sendJetton",
      value: JSON.stringify({ minterAddress, state: params }),
    });

    setSearchParams(params);
  }, [setSearchParams, state]);

  const onChange = useCallback(
    (field: Partial<SendJettonState>) => {
      const params = stateToSearch({ ...state, ...field });

      sendBackground.message("storeOperation", {
        kind: "sendJetton",
        value: JSON.stringify({ minterAddress, state: params }),
      });

      setSearchParams(params);
    },
    [setSearchParams, state]
  );

  const onSend = useCallback(
    (seqNo: number, transactionId?: string) => {
      const params = { seqNo: String(seqNo) };

      if (transactionId) {
        // if transaction init from dApp, return approve
        sendBackground.message("approveTransaction", {
          id: Number(transactionId),
          seqNo,
        });
      } else {
        sendBackground.message("storeOperation", {
          kind: "sendJetton",
          value: JSON.stringify({ minterAddress, state: params }),
        });
      }

      setSearchParams(params);
    },
    [setSearchParams]
  );

  const onConfirm = useCallback(() => {
    sendBackground.message("storeOperation", null);

    setSearchParams({ confirm: String(seqNo) });
  }, [setSearchParams, seqNo]);

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
      <SendJettonInputView
        state={state}
        jetton={jetton}
        onChange={onChange}
        onSend={onSubmit}
      />
    );
  }

  return (
    <SendJettonConfirm
      state={state}
      jetton={jetton}
      balance={balance}
      onSend={onSend}
    />
  );
};
