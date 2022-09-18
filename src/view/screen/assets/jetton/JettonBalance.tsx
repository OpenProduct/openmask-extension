import { useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Container, Icon } from "../../../components/Components";
import { ReceiveIcon, SendIcon } from "../../../components/Icons";
import { AppRoute } from "../../../routes";
import { formatTonValue } from "../../../utils";
import { useJettonWalletBalance } from "../../home/wallet/assets/api";
import { JettonStateContext } from "./context";

const Block = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Row = styled.div`
  display: flex;
  gap: 20px;
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  cursor: pointer;
`;

const Text = styled.span`
  font-size: larger;
`;

const NetworkLogo = styled.span`
  font-size: 3em;
`;

const Amount = styled.span`
  margin: ${(props) => props.theme.padding} 0;
  font-size: xx-large;
`;

const ActionIcon = styled(Icon)`
  background: ${(props) => props.theme.blue};
  color: ${(props) => props.theme.background};
`;

export const JettonBalance = () => {
  const navigate = useNavigate();
  const state = useContext(JettonStateContext);

  const { data: balance } = useJettonWalletBalance(state);
  const formatted = useMemo(() => {
    return balance ? formatTonValue(balance) : "-";
  }, [balance]);

  return (
    <Block>
      <NetworkLogo>
        <img
          src={state.state.image}
          width="40px"
          height="40px"
          alt="Jetton Logo"
        />
      </NetworkLogo>
      <Amount>
        {formatted} {state.state.symbol}
      </Amount>
      <Row>
        <Column onClick={() => navigate(AppRoute.receive)}>
          <ActionIcon>
            <ReceiveIcon />
          </ActionIcon>
          <Text>Receive</Text>
        </Column>
        <Column onClick={() => navigate(AppRoute.send)}>
          <ActionIcon>
            <SendIcon />
          </ActionIcon>
          <Text>Send</Text>
        </Column>
      </Row>
    </Block>
  );
};
