import { FC, useCallback, useContext } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useNonBounceableAddress } from "../../../../libs/address";
import { DexStocks } from "../../../../libs/entries/stock";
import { Container } from "../../../components/Components";
import { ConnectBadge } from "../../../components/ConnectBadge";
import { Tabs } from "../../../components/Tabs";
import { WalletStateContext } from "../../../context";
import { AppRoute } from "../../../routes";
import { Balance } from "./WalletBalance";
import { WalletMenu } from "./WalletMenu";
import { WalletName } from "./WalletName";
import { Activities } from "./activities/Activities";
import { AssetsList } from "./assets/AssetsList";

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

export const WalletInfo = () => {
  const wallet = useContext(WalletStateContext);
  const address = useNonBounceableAddress(wallet.address);

  return (
    <Block>
      <ConnectBadge />
      <WalletName address={address} name={wallet.name} />
      <WalletMenu address={address} />
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
