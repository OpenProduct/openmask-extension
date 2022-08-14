import { FC, useCallback, useContext } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Badge, Container } from "../../components/Components";
import { Tabs } from "../../components/Tabs";
import { WalletAddressContext, WalletStateContext } from "../context";
import { AppRoute } from "../routes";
import { Activities } from "./Activities";
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
`;

export const WalletInfo = () => {
  const wallet = useContext(WalletStateContext);
  const address = useContext(WalletAddressContext);
  return (
    <Block>
      <Connect>Connected</Connect>
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
