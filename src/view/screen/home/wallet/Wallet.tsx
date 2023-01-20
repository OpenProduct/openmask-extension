import { FC, useCallback, useContext } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styled, { css } from "styled-components";
import { DexStocks } from "../../../../libs/entries/stock";
import { Badge, Container } from "../../../components/Components";
import { ConnectBadge } from "../../../components/ConnectBadge";
import { Tabs } from "../../../components/Tabs";
import { WalletStateContext } from "../../../context";
import { AppRoute } from "../../../routes";
import { Activities } from "./activities/Activities";
import { AssetsList } from "./assets/AssetsList";
import { Balance } from "./WalletBalance";
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
  const wallet = useContext(WalletStateContext);

  return (
    <Block>
      <ConnectBadge />
      <WalletName address={wallet.address} name={wallet.name} />
      <WalletMenu address={wallet.address} />
    </Block>
  );
};

const tabs = ["Assets", "Activity"];

export const WalletHome: FC<{
  price?: number;
  balance?: string;
  stocks?: DexStocks;
}> = ({ price, balance, stocks }) => {
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
        <Route
          path="*"
          element={
            <AssetsList balance={balance} price={price} stocks={stocks} />
          }
        />
      </Routes>
    </>
  );
};
