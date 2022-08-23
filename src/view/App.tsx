import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC, useEffect, useMemo, useState } from "react";
import {
  MemoryRouter,
  Route,
  Routes,
  useLocation,
  useNavigate,
} from "react-router-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import TonWeb from "tonweb";
import { AccountState } from "../libs/entries/account";
import {
  AccountStateContext,
  NetworkContext,
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "./context";
import { askBackground, uiEventEmitter } from "./event";
import { useNetworkConfig } from "./lib/network";
import { useNetwork } from "./lib/state";
import { useAccountState } from "./lib/state/account";
import { any, AppRoute } from "./routes";
import { ConnectDApp } from "./screen/connect/ConnectDApp";
import { Header } from "./screen/home/Header";
import { Home } from "./screen/home/Home";
import { Settings } from "./screen/home/settings/Settings";
import { ConnectWallet } from "./screen/import/ConnectWallet";
import { CreatePassword, Initialize } from "./screen/initialize/Initialize";
import { Loading } from "./screen/Loading";
import { Unlock } from "./screen/unlock/Unlock";
import defaultTheme from "./styles/defaultTheme";

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

const useLock = () => {
  const [lock, setLock] = useState(true);
  useEffect(() => {
    askBackground<boolean>()
      .message("isLock")
      .then((value) => setLock(value));

    const unlock = () => {
      setLock(false);
    };
    const locked = () => {
      setLock(true);
    };
    uiEventEmitter.on("unlock", unlock);
    uiEventEmitter.on("locked", locked);

    return () => {
      uiEventEmitter.off("unlock", unlock);
      uiEventEmitter.off("locked", locked);
    };
  }, []);

  return lock;
};
const Content: FC<{
  account: AccountState;
  ton: TonWeb;
  lock: boolean;
}> = ({ account, ton, lock }) => {
  const isInitialized = account.wallets.length > 0;

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (window.location.hash) {
      console.log(window.location.hash);
      navigate(window.location.hash.substring(1));
    }
  }, []);

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
          <Route path={any(AppRoute.import)} element={<ConnectWallet />} />
          <Route path={any(AppRoute.connect)} element={<ConnectDApp />} />
          <Route path={AppRoute.setting} element={<Settings />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </WalletContractContext.Provider>
    </WalletStateContext.Provider>
  );
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
  const lock = useLock();
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
          <Header lock={lock} />
          <Content account={data} ton={tonProvider} lock={lock} />
        </TonProviderContext.Provider>
      </NetworkContext.Provider>
    </AccountStateContext.Provider>
  );
};

export default Provider;
