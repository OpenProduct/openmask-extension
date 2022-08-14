import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, useMemo } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import TonWeb from "tonweb";
import { useNetwork } from "../lib/state";
import { AccountState, useAccountState } from "../lib/state/account";
import { useNetworkConfig } from "../lib/state/network";
import defaultTheme from "../styles/defaultTheme";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "./context";
import { Header } from "./Header";
import { Home } from "./Home";
import { Import } from "./import/Import";
import { Initialize } from "./initialize/Initialize";
import { Loading } from "./Loading";
import { any, AppRoute } from "./routes";
import { Settings } from "./settings/Settings";
import { Unlock } from "./Unlock";

const queryClient = new QueryClient();

const GlobalStyle = createGlobalStyle`
body {
  margin: 0;
  font-family: ui-sans-serif, system-ui,-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Arial,Noto Sans,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
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

const Content: FC<{ account: AccountState; ton: TonWeb }> = ({
  account,
  ton,
}) => {
  const location = useLocation();

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
  }, [wallet, wallet?.version, ton]);

  if (
    !account.isInitialized &&
    !location.pathname.startsWith(AppRoute.import)
  ) {
    return <Initialize />;
  } else {
    return (
      <WalletStateContext.Provider value={wallet!}>
        <WalletContractContext.Provider value={walletContract!}>
          <Routes>
            <Route path={AppRoute.unlock} element={<Unlock />} />
            <Route path={AppRoute.setting} element={<Settings />} />
            <Route path={any(AppRoute.import)} element={<Import />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </WalletContractContext.Provider>
      </WalletStateContext.Provider>
    );
  }
};

const Provider: FC = () => {
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

const App = () => {
  const { data: network } = useNetwork();
  const { isLoading, data } = useAccountState();

  const config = useNetworkConfig();

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
          <Header />
          <Content account={data} ton={tonProvider} />
        </TonProviderContext.Provider>
      </NetworkContext.Provider>
    </AccountStateContext.Provider>
  );
};

export default Provider;
