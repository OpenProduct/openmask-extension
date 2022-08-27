import { FC, useCallback, useContext, useMemo } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { Badge, Container } from "../../../components/Components";
import { Tabs } from "../../../components/Tabs";
import { WalletAddressContext, WalletStateContext } from "../../../context";
import { AppRoute } from "../../../routes";
import { useActiveTabs } from "../../connect/api";
import { useConnections } from "../../connections/api";
import { Activities } from "./activities/Activities";
import { Assets } from "./Assets";
import { Balance } from "./balance/Balance";
import { WalletMenu } from "./WalletMenu";
import { WalletName } from "./WalletName";

const Block = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.lightGray};
  position: relative;
  padding: 5px ${(props) => props.theme.padding};
`;

const Connect = styled(Badge)`
  position: absolute;
  left: ${(props) => props.theme.padding};
  padding: 5px 8px;
  font-size: smaller;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Dot = styled.div<{ isConnected: boolean }>`
  width: 5px;
  height: 5px;
  border-radius: 50%;
  
  ${(props) =>
    props.isConnected
      ? css`
          background: green;
        `
      : css`
          background: red;
        `}}
`;

export const WalletInfo = () => {
  const navigate = useNavigate();
  const wallet = useContext(WalletStateContext);
  const address = useContext(WalletAddressContext);

  const { data: connections } = useConnections();
  const { data: tab } = useActiveTabs();

  const isConnected = useMemo(() => {
    if (!connections || !tab || !tab.url) return false;
    const url = new URL(tab.url);
    return connections[url.origin] != null;
  }, [connections, tab]);

  return (
    <Block>
      <Connect onClick={() => navigate(AppRoute.connections)}>
        {isConnected ? (
          <>
            <Dot isConnected />
            <span>Connected</span>
          </>
        ) : (
          <>Not Connected</>
        )}
      </Connect>
      <WalletName address={address} name={wallet.name} />
      <WalletMenu address={address} />
    </Block>
  );
};

const tabs = ["Assets", "Activity"];

export const WalletHome: FC<{
  price?: number;
  balance?: string;
}> = ({ price, balance }) => {
  const navigate = useNavigate();

  const location = useLocation();

  const onChange = useCallback(
    (tab: typeof tabs[number]) => {
      navigate(tab === "Assets" ? AppRoute.home : AppRoute.activities, {
        replace: true,
      });
    },
    [navigate]
  );

  const active = location.pathname === AppRoute.activities ? tabs[1] : tabs[0];

  return (
    <>
      <Balance balance={balance} price={price} />
      <Tabs options={tabs} active={active} onChange={onChange} />
      <Routes>
        <Route path={AppRoute.activities} element={<Activities />} />
        <Route path="*" element={<Assets balance={balance} price={price} />} />
      </Routes>
    </>
  );
};
