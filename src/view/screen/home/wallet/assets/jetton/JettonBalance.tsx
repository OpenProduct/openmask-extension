import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { formatAmountValue } from "../../../../../../libs/state/decimalsService";
import {
  BallanceBlock,
  BallanceButton,
  BallanceButtonRow,
} from "../../../../../components/BalanceButton";
import { ReceiveIcon, SendIcon } from "../../../../../components/Icons";
import { JettonLogo } from "../../../../../components/JettonRow";
import { relative } from "../../../../../routes";
import { useJettonWalletBalance } from "../api";
import { JettonStateContext } from "./context";
import { JettonRoute } from "./route";

const JettonWrapper = styled.span`
  font-size: 2em;
`;

const Amount = styled.span`
  margin: ${(props) => props.theme.padding} 0;
  font-size: xx-large;
`;

export const JettonBalance = () => {
  const navigate = useNavigate();
  const state = useContext(JettonStateContext);

  const { data: balance } = useJettonWalletBalance(state);
  const formatted = useMemo(() => {
    return balance ? formatAmountValue(balance, state.state.decimals) : "-";
  }, [balance]);

  return (
    <BallanceBlock>
      <JettonWrapper>
        <JettonLogo image={state.state.image} size={40} />
      </JettonWrapper>
      <Amount>
        {formatted} {state.state.symbol}
      </Amount>
      <BallanceButtonRow>
        <BallanceButton
          label="Receive"
          onClick={() => navigate(relative(JettonRoute.receive))}
        >
          <ReceiveIcon />
        </BallanceButton>
        <BallanceButton
          label="Send"
          onClick={() => navigate(relative(JettonRoute.send))}
        >
          <SendIcon />
        </BallanceButton>
      </BallanceButtonRow>
    </BallanceBlock>
  );
};
