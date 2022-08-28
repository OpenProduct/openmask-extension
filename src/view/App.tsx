import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import TonWeb from "tonweb";
import { AccountState } from "../libs/entries/account";
import { getNetworkConfig } from "../libs/entries/network";
import {
  useAccountState,
  useInitialRedirect,
  useLock,
  useNetwork,
} from "./api";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "./context";
import { any, AppRoute } from "./routes";
import { ConnectDApp } from "./screen/connect/ConnectDApp";
import { Connections } from "./screen/connections/Connections";
import { Header } from "./screen/home/Header";
import { Home } from "./screen/home/Home";
import { ConnectWallet } from "./screen/import/ConnectWallet";
import { CreatePassword, Initialize } from "./screen/initialize/Initialize";
import { Loading } from "./screen/Loading";
import { Settings } from "./screen/settings/Settings";
import { Unlock } from "./screen/unlock/Unlock";
import defaultTheme from "./styles/defaultTheme";

const ContentRouter: FC<{
  account: AccountState;
  ton: TonWeb;
  lock: boolean;
}> = ({ account, ton, lock }) => {
  const isInitialized = account.wallets.length > 0;

  const location = useLocation();

  useInitialRedirect();

  const wallet = account.wallets.find(
    (w) => w.address === account.activeWallet
  );

  const walletContract = useMemo(() => {
    if (!wallet) return undefined;
    const WalletClass = ton.wallet.all[wallet.version];
    return new WalletClass(ton.provider, {
      publicKey: TonWeb.utils.hexToBytes(wallet.publicKey),
      wc: 0,
    });
  }, [wallet, ton]);

  if (isInitialized && lock) {
    return <Unlock />;
  }
  if (!isInitialized && !location.pathname.startsWith(AppRoute.import)) {
    return <Initialize />;
  }
  if (lock) {
    return <CreatePassword />;
  }

  return (
    <WalletStateContext.Provider value={wallet!}>
      <WalletContractContext.Provider value={walletContract!}>
        <Routes>
          <Route path={AppRoute.setting} element={<Settings />} />
          <Route path={AppRoute.connections} element={<Connections />} />
          <Route path={any(AppRoute.import)} element={<ConnectWallet />} />
          <Route path={any(AppRoute.connect)} element={<ConnectDApp />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </WalletContractContext.Provider>
    </WalletStateContext.Provider>
  );
};

const App = () => {
  const lock = useLock();
  const { data: network } = useNetwork();
  const { isLoading, data } = useAccountState();

  const config = getNetworkConfig(network);

  const tonProvider = useMemo(() => {
    return new TonWeb(
      new TonWeb.HttpProvider(config.rpcUrl, { apiKey: config.apiKey })
    );
  }, [config]);

  if (isLoading || !data || !network) {
    return <Loading />;
  }

  return (
    <AccountStateContext.Provider value={data}>
      <NetworkContext.Provider value={network}>
        <TonProviderContext.Provider value={tonProvider}>
          <Header lock={lock} />
          <ContentRouter account={data} ton={tonProvider} lock={lock} />
        </TonProviderContext.Provider>
      </NetworkContext.Provider>
    </AccountStateContext.Provider>
  );
};

const queryClient = new QueryClient();

const GlobalStyle = createGlobalStyle`
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background: #dddddd;
}

code {
  font-family: source-code-pro, Menlo, Monaco, Consolas, 'Courier New',
    monospace;
}
`;

const Container = styled.div`
  background-color: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color};
  min-width: 375px;
  max-width: 600px;
  margin: 0 auto;
  height: 600px;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  font-size: 110%;
`;

const BaseProvider: FC = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <QueryClientProvider client={queryClient}>
        <GlobalStyle />
        <MemoryRouter>
          <Container>
            <App />
          </Container>
        </MemoryRouter>
      </QueryClientProvider>
    </ThemeProvider>
  );
};

export default BaseProvider;
