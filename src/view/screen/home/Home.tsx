import { useContext, useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { WalletAddressContext, WalletStateContext } from "../../context";
import { useCoinPrice } from "../../lib/api";
import { useAddress, useBalance } from "../../lib/state/wallet";
import { any, AppRoute } from "../../routes";
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
  const navigate = useNavigate();

  const wallet = useContext(WalletStateContext);

  const { data: address } = useAddress();

  const friendly =
    address?.toString(true, true, wallet.isBounceable) ?? wallet.address;

  const { data: balance } = useBalance(friendly);
  const { data: price } = useCoinPrice(balance != null);

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
