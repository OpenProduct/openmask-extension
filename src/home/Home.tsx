import { useEffect } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useCoinPrice } from "../lib/api";
import { useAddress, useBalance, useWalletContract } from "../lib/state/wallet";
import { any, AppRoute } from "./routes";
import { Receive } from "./wallet/receive/Receive";
import { Send } from "./wallet/send/Send";
import { WalletHome, WalletInfo } from "./wallet/Wallet";

const Body = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

export const Home = () => {
  const navigate = useNavigate();
  const wallet = useWalletContract();
  const { data: balance } = useBalance(wallet);
  const { data: address } = useAddress(wallet);

  const friendly = address?.toString(true, true, true) ?? wallet.state.address;

  const { data: price } = useCoinPrice(balance != null);

  useEffect(() => {
    if (window.location.hash) {
      navigate(window.location.hash.substring(1));
    }
  }, [window.location.hash]);

  return (
    <Body>
      <WalletInfo address={friendly} wallet={wallet} />
      <Routes>
        <Route path={AppRoute.send} element={<Send wallet={wallet} />} />
        <Route
          path={any(AppRoute.receive)}
          element={<Receive address={friendly} />}
        />
        <Route
          path="*"
          element={
            <WalletHome wallet={wallet} price={price} balance={balance} />
          }
        />
      </Routes>
    </Body>
  );
};
