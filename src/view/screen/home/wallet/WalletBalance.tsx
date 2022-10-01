import { FC, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  BallanceButton,
  BallanceButtonRow,
} from "../../../components/BalanceButton";
import { Container } from "../../../components/Components";
import { ReceiveIcon, SendIcon, TonIcon } from "../../../components/Icons";
import { AppRoute } from "../../../routes";
import { formatTonValue } from "../../../utils";
import { Fiat } from "./Fiat";

const Block = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NetworkLogo = styled.span`
  font-size: 3em;
`;

const Amount = styled.span`
  margin: ${(props) => props.theme.padding} 0 5px;
  font-size: xx-large;
`;

export interface BalanceProps {
  balance?: string;
  price?: number;
}

export const Balance: FC<BalanceProps> = ({ balance, price }) => {
  const navigate = useNavigate();

  const formatted = useMemo(() => {
    return balance ? formatTonValue(balance) : "-";
  }, [balance]);

  return (
    <Block>
      <NetworkLogo>
        <TonIcon />
      </NetworkLogo>
      <Amount>{formatted} TON</Amount>
      <Fiat balance={balance} price={price} />
      <BallanceButtonRow>
        <BallanceButton
          label="Receive"
          onClick={() => navigate(AppRoute.receive)}
        >
          <ReceiveIcon />
        </BallanceButton>
        <BallanceButton label="Send" onClick={() => navigate(AppRoute.send)}>
          <SendIcon />
        </BallanceButton>
      </BallanceButtonRow>
    </Block>
  );
};
