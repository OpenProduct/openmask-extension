import styled from "styled-components";
import { Badge, Container, Icon } from "../components/Components";
import { ReceiveIcon, SendIcon, TonIcon } from "../components/Icons";
import { useAddress, useBalance, useWalletContract } from "../lib/state/wallet";
import { Header } from "./Header";
import { Fiat } from "./wallet/Fiat";
import { WalletMenu } from "./wallet/WalletMenu";
import { WalletName } from "./wallet/WalletName";

const Body = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const Wallet = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.lightGray};
  position: relative;
  padding: 5px ${(props) => props.theme.padding};
`;

const Balance = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Connect = styled(Badge)`
  position: absolute;
  left: ${(props) => props.theme.padding};
  padding: 5px 8px;
  font-size: smaller;
`;

const Amount = styled.span`
  margin: ${(props) => props.theme.padding} 0 5px;
  font-size: xx-large;
`;

const ActionIcon = styled(Icon)`
  background: #0088cb;
  color: white;
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

export const Home = () => {
  const wallet = useWalletContract();
  const { data: balance } = useBalance(wallet);
  const { data: address } = useAddress(wallet);

  const friendly = address?.toString(true, true, true) ?? wallet.state.address;

  return (
    <>
      <Header />
      <Body>
        <Wallet>
          <Connect>Connected</Connect>
          <WalletName address={friendly} name={wallet.state.name} />
          <WalletMenu address={friendly} />
        </Wallet>
        <Balance>
          <TonIcon />
          <Amount>{balance ?? "..."} TON</Amount>
          <Fiat balance={balance} />
          <Row>
            <Column>
              <ActionIcon>
                <ReceiveIcon />
              </ActionIcon>
              <Text>Receive</Text>
            </Column>
            <Column>
              <ActionIcon>
                <SendIcon />
              </ActionIcon>
              <Text>Send</Text>
            </Column>
          </Row>
        </Balance>
      </Body>
    </>
  );
};
