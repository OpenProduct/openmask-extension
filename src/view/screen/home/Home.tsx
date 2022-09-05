import { useContext } from "react";
import { Route, Routes } from "react-router-dom";
import styled from "styled-components";
import { WalletAddressContext, WalletStateContext } from "../../context";
import { any, AppRoute } from "../../routes";
import { useBalance, useCoinPrice } from "./api";
import { Receive } from "./wallet/receive/Receive";
import { Send } from "./wallet/send/Send";
import { WalletSettings } from "./wallet/setttings/Settings";
import { WalletHome, WalletInfo } from "./wallet/Wallet";

const Body = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

export const Home = () => {
  const wallet = useContext(WalletStateContext);

  const { data: balance } = useBalance(wallet.address);
  const { data: price } = useCoinPrice(balance != null);

  return (
    <WalletAddressContext.Provider value={wallet.address}>
      <Body>
        <WalletInfo />
        <Routes>
          <Route
            path={any(AppRoute.send)}
            element={<Send price={price} balance={balance} />}
          />
          <Route path={any(AppRoute.receive)} element={<Receive />} />
          <Route path={any(AppRoute.wallet)} element={<WalletSettings />} />
          <Route
            path="*"
            element={<WalletHome price={price} balance={balance} />}
          />
        </Routes>
      </Body>
    </WalletAddressContext.Provider>
  );
};
