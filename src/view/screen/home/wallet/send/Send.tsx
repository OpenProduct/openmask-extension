import { useQueryClient } from "@tanstack/react-query";
import React, { FC, useCallback, useContext, useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import styled from "styled-components";
import ExtensionPlatform from "../../../../../libs/service/extension";
import {
  Body,
  ButtonBottomRow,
  ButtonColumn,
  ButtonNegative,
  ButtonPositive,
  Center,
  Gap,
  H1,
  Input,
  Text,
} from "../../../../components/Components";
import { HomeButton } from "../../../../components/HomeButton";
import { LinkIcon } from "../../../../components/Icons";
import { LoadingLogo } from "../../../../components/Logo";
import { NetworkContext, WalletAddressContext } from "../../../../context";
import { askBackground, sendBackground } from "../../../../event";
import { AppRoute } from "../../../../routes";
import { formatTonValue } from "../../../api";
import { useNetworkConfig } from "../../api";
import { State, stateToSearch, toState } from "./api";
import { CancelButton, ConfirmView } from "./ConfirmView";

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

interface Props {
  price?: number;
  balance?: string;
}

interface InputProps {
  balance?: string;
  state: State;
  onChange: (field: Partial<State>) => void;
  onSend: () => void;
}

const InputView: FC<InputProps> = ({ state, balance, onChange, onSend }) => {
  const formatted = useMemo(() => {
    return balance ? formatTonValue(balance) : "-";
  }, [balance]);

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

      <Label>Comment (optional)</Label>
      <Input
        value={state.comment}
        onChange={(e) => onChange({ comment: e.target.value })}
      />

      <Gap />

      <ButtonBottomRow>
        <CancelButton transactionId={state.id} />
        <ButtonPositive onClick={onSend}>Next</ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};

const timeout = 60 * 1000; // 60 sec

const LoadingView: FC<{ seqNo: string; onConfirm: () => void }> = React.memo(
  ({ seqNo, onConfirm }) => {
    const client = useQueryClient();
    const network = useContext(NetworkContext);
    const address = useContext(WalletAddressContext);

    useEffect(() => {
      askBackground<void>(timeout)
        .message("confirmSeqNo", parseInt(seqNo))
        .then(() => {
          sendBackground.message("accountsChanged", [address]);
          client.invalidateQueries([network, address]);
          onConfirm();
        });
    }, [seqNo, onConfirm, client, network, address]);

    return (
      <Body>
        <Gap />
        <LoadingLogo />
        <Center>
          <H1>Await confirmation</H1>
          <Text>~15 sec</Text>
        </Center>
        <Gap />
      </Body>
    );
  }
);

const SuccessView = () => {
  const navigate = useNavigate();
  const config = useNetworkConfig();
  const address = useContext(WalletAddressContext);

  return (
    <>
      <HomeButton />
      <Body>
        <Gap />
        <LoadingLogo />
        <Center>
          <H1>Success</H1>
          <Text>Transaction confirmed</Text>
        </Center>
        <ButtonColumn>
          <ButtonNegative
            onClick={() => {
              ExtensionPlatform.openTab({
                url: `${config.scanUrl}/address/${address}`,
              });
            }}
          >
            View on tonscan.org <LinkIcon />
          </ButtonNegative>
          <ButtonPositive onClick={() => navigate(AppRoute.home)}>
            Close
          </ButtonPositive>
        </ButtonColumn>

        <Gap />
      </Body>
    </>
  );
};

export const Send: FC<Props> = ({ price, balance }) => {
  const [searchParams, setSearchParams] = useSearchParams();

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
      value: JSON.stringify(params),
    });

    setSearchParams(params);
  }, [setSearchParams, state]);

  const onChange = useCallback(
    (field: Partial<State>) => {
      const params = stateToSearch({ ...state, ...field });

      sendBackground.message("storeOperation", {
        kind: "send",
        value: JSON.stringify(params),
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
          kind: "send",
          value: JSON.stringify(params),
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
    return <SuccessView />;
  }

  if (seqNo !== null) {
    return <LoadingView seqNo={seqNo} onConfirm={onConfirm} />;
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
