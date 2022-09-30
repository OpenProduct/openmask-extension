import { FC, useCallback, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { JettonAsset } from "../../../../../../../libs/entries/asset";
import {
  Body,
  ButtonBottomRow,
  ButtonPositive,
  Gap,
  H1,
} from "../../../../../../components/Components";
import { InputField } from "../../../../../../components/InputField";
import { SendCancelButton } from "../../../../../../components/send/SendButtons";
import { SendLoadingView } from "../../../../../../components/send/SendLoadingView";
import { SendSuccessView } from "../../../../../../components/send/SendSuccessView";
import { WalletAddressContext } from "../../../../../../context";
import { sendBackground } from "../../../../../../event";
import { useJettonWalletBalance } from "../../api";
import { JettonMinterAddressContext, JettonStateContext } from "../context";
import { SendJettonState, stateToSearch, toSendJettonState } from "./api";
import { SendJettonConfirm } from "./SendJettonConfirm";

interface InputProps {
  jetton: JettonAsset;
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

      <InputField
        label="Enter wallet address"
        value={state.address}
        onChange={(e) => onChange({ address: e.target.value })}
      />

      <InputField
        label="Amount"
        type="number"
        value={state.amount}
        onChange={(e) => onChange({ amount: e.target.value })}
      />

      <InputField
        label="Comment (optional)"
        value={state.comment}
        onChange={(e) => onChange({ comment: e.target.value })}
      />

      <Gap />
      <ButtonBottomRow>
        <SendCancelButton homeRoute="../" />
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
        sendBackground.message("approveRequest", {
          id: Number(transactionId),
          payload: seqNo,
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
