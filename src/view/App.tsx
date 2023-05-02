import { ALL, hexToBytes, TonHttpProvider } from "@openproduct/web-sdk";
import { getHttpEndpoint, Network } from "@orbs-network/ton-access";
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from "@tanstack/react-query";
import React, { FC, Suspense, useMemo } from "react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { TonClient } from "ton";
import { AccountState } from "../libs/entries/account";
import { NetworkConfig, selectNetworkConfig } from "../libs/entries/network";
import { QueryType } from "../libs/store/browserStore";
import {
  useAccountState,
  useInitialRedirect,
  useLock,
  useNetwork,
  useNetworkConfig,
  useScript,
} from "./api";
import {
  AccountStateContext,
  NetworkContext,
  NetworksContext,
  TonClientContext,
  TonProviderContext,
  WalletContractContext,
  WalletStateContext,
} from "./context";
import { useInitialRendering } from "./hooks/useInitialRendering";
import { any, AppRoute } from "./routes";
import { useAnalytics } from "./screen/Analytics";
import { Header } from "./screen/home/Header";
import { CreatePassword, Initialize } from "./screen/initialize/Initialize";
import { LedgerNotification } from "./screen/ledger/LedgerNotification";
import { Loading } from "./screen/Loading";
import { PasswordNotification } from "./screen/unlock/PasswordNotification";
import { Unlock } from "./screen/unlock/Unlock";
import { WebAuthnNotification } from "./screen/unlock/WebAuthnNotification";
import defaultTheme from "./styles/defaultTheme";

const ConnectWallet = React.lazy(() => import("./screen/import/ConnectWallet"));
const Connections = React.lazy(
  () => import("./screen/connections/Connections")
);
const Home = React.lazy(() => import("./screen/home/Home"));
const Settings = React.lazy(() => import("./screen/settings/Settings"));
const Notifications = React.lazy(
  () => import("./screen/notifications/Notifications")
);

const ContentRouter: FC<{
  account: AccountState;
  ton: TonHttpProvider;
  lock: boolean;
  script: string | null;
  notification: boolean;
  justOpen: boolean;
}> = ({ account, ton, lock, script, notification, justOpen }) => {
  const location = useLocation();

  const wallet = account.wallets.find(
    (w) => w.address === account.activeWallet
  );

  useInitialRedirect(notification, wallet?.address);
  useAnalytics(account, wallet);

  const walletContract = useMemo(() => {
    if (!wallet) return undefined;
    const WalletClass = ALL[wallet.version];
    return new WalletClass(ton, {
      publicKey: hexToBytes(wallet.publicKey),
      wc: 0,
    });
  }, [wallet, ton]);

  if (script != null && lock) {
    return <Unlock justOpen={justOpen} />;
  }
  if (
    account.wallets.length === 0 &&
    !location.pathname.startsWith(AppRoute.import)
  ) {
    return <Initialize />;
  }
  if (lock || script == null) {
    return <CreatePassword />;
  }

  return (
    <WalletStateContext.Provider value={wallet!}>
      <WalletContractContext.Provider value={walletContract!}>
        <Suspense fallback={<Loading />}>
          <Routes>
            <Route path={AppRoute.notifications} element={<Notifications />} />
            <Route path={any(AppRoute.settings)} element={<Settings />} />
            <Route path={AppRoute.connections} element={<Connections />} />
            <Route path={any(AppRoute.import)} element={<ConnectWallet />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
        <LedgerNotification />
      </WalletContractContext.Provider>
    </WalletStateContext.Provider>
  );
};

const useProviders = (network: string | undefined, config: NetworkConfig) => {
  return useQuery([QueryType.provider, network, config], async () => {
    if (config.isCustom) {
      return [
        new TonHttpProvider(config.rpcUrl, { apiKey: config.apiKey }),
        new TonClient({ endpoint: config.rpcUrl, apiKey: config.apiKey }),
      ] as const;
    } else {
      const endpoint = await getHttpEndpoint({ network: network as Network });
      return [
        new TonHttpProvider(endpoint),
        new TonClient({ endpoint }),
      ] as const;
    }
  });
};

const App = () => {
  const lock = useLock();
  const { data: script } = useScript();
  const { data: network } = useNetwork();
  const { data: networks } = useNetworkConfig();
  const { isLoading, data } = useAccountState();

  const config = selectNetworkConfig(network, networks);
  const justOpen = useInitialRendering();

  const notification = useMemo(() => {
    return window.location.hash.includes(AppRoute.notifications);
  }, []);

  const { data: providers } = useProviders(network, config);

  if (
    isLoading ||
    !data ||
    !network ||
    !networks ||
    script === undefined ||
    lock === undefined ||
    providers === undefined
  ) {
    return <Loading />;
  }

  const [tonProvider, tonClient] = providers;
  return (
    <AccountStateContext.Provider value={data}>
      <NetworkContext.Provider value={network}>
        <NetworksContext.Provider value={networks}>
          <TonProviderContext.Provider value={tonProvider}>
            <TonClientContext.Provider value={tonClient}>
              <Header lock={lock || notification} />
              <ContentRouter
                account={data}
                ton={tonProvider}
                lock={lock}
                script={script}
                notification={notification}
                justOpen={justOpen}
              />
              <PasswordNotification />
              <WebAuthnNotification />
            </TonClientContext.Provider>
          </TonProviderContext.Provider>
        </NetworksContext.Provider>
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

#root {
  overflow: hidden;
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
