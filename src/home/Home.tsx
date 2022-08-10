import styled from "styled-components";
import { Badge, Container, Icon } from "../components/Components";
import { MoreIcon, TonIcon } from "../components/Icons";
import { WalletName } from "../components/WalletName";
import { useAccountState } from "../lib/state/account";
import { Header } from "./Header";

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

const Menu = styled.div`
  position: absolute;
  right: ${(props) => props.theme.padding};
`;

const useActiveWallet = () => {
  const { data } = useAccountState();
  if (!data) return;

  console.log(data);

  return data?.wallets[data.activeWallet - 1];
};

export const Home = () => {
  const wallet = useActiveWallet();

  return (
    <>
      <Header />
      <Body>
        <Wallet>
          <Connect>Connected</Connect>
          {wallet && <WalletName wallet={wallet} />}
          <Menu>
            <Icon>
              <MoreIcon />
            </Icon>
          </Menu>
        </Wallet>
        <Balance>
          <TonIcon />
        </Balance>
      </Body>
    </>
  );
};
