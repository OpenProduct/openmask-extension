import { useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCoinPrice } from "../lib/api";
import { useAddress, useBalance } from "../lib/state/wallet";
import { WalletAddressContext, WalletStateContext } from "./context";
import { any, AppRoute } from "./routes";
import { Receive } from "./wallet/receive/Receive";
import { Send } from "./wallet/send/Send";
import { WalletHome, WalletInfo } from "./wallet/Wallet";
import { WalletSettings } from "./wallet/WalletSettings";

const Body = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

export const Home = () => {
  const navigate = useNavigate();

  const wallet = useContext(WalletStateContext);

  const { data: balance } = useBalance(wallet.address);
  const { data: price } = useCoinPrice(balance != null);

  const { data: address } = useAddress();

  const friendly = address?.toString(true, true, true) ?? wallet.address;

  useEffect(() => {
    if (window.location.hash) {
      navigate(window.location.hash.substring(1));
    }
  }, [window.location.hash]);

  return (
    <WalletAddressContext.Provider value={friendly}>
      <Body>
        <WalletInfo />
        <Routes>
          <Route path={AppRoute.send} element={<Send />} />
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
