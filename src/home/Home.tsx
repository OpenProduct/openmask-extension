import { useCallback, useEffect } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Badge, Container, Icon } from "../components/Components";
import { ReceiveIcon, SendIcon, TonIcon } from "../components/Icons";
import { Tabs } from "../components/Tabs";
import { useCoinPrice } from "../lib/api";
import { useAddress, useBalance, useWalletContract } from "../lib/state/wallet";
import { Activities } from "./wallet/Activities";
import { Assets } from "./wallet/Assets";
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
  background: ${(props) => props.theme.blue};
  color: ${(props) => props.theme.background};
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

const tabs = ["Assets", "Activity"];

enum HomeRouters {
  assets = "/",
  activities = "/activity",
}

export const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const wallet = useWalletContract();
  const { data: balance } = useBalance(wallet);
  const { data: address } = useAddress(wallet);

  const friendly = address?.toString(true, true, true) ?? wallet.state.address;

  const { data: price } = useCoinPrice(balance != null);

  const hash = window.location.hash;

  useEffect(() => {
    if (hash) {
      console.log(String(hash));
      navigate(hash.substring(1));
    }
  }, [hash]);

  const onChange = useCallback(
    (tab: typeof tabs[number]) => {
      navigate(tab === "Assets" ? HomeRouters.assets : HomeRouters.activities, {
        replace: true,
      });
    },
    [navigate]
  );

  const active =
    location.pathname === HomeRouters.activities ? tabs[1] : tabs[0];

  return (
    <Body>
      <Wallet>
        <Connect>Connected</Connect>
        <WalletName address={friendly} name={wallet.state.name} />
        <WalletMenu address={friendly} />
      </Wallet>
      <Balance>
        <NetworkLogo>
          <TonIcon />
        </NetworkLogo>

        <Amount>{balance ?? "..."} TON</Amount>
        <Fiat balance={balance} price={price} />
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
      <Tabs options={tabs} active={active} onChange={onChange} />
      <Routes>
        <Route
          path={HomeRouters.assets}
          element={<Assets balance={balance} price={price} />}
        />
        <Route
          path={HomeRouters.activities}
          element={<Activities wallet={wallet} price={price} />}
        />
      </Routes>
    </Body>
  );
};
