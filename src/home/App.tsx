import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FC } from "react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { AccountState, useAccountState } from "../lib/state/account";
import defaultTheme from "../styles/defaultTheme";
import { Home } from "./Home";
import { Initialize } from "./initialize/Initialize";
import { Loading } from "./Loading";
import { AppRoute } from "./routes";
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
`;

const Content: FC<{ account: AccountState | undefined }> = ({ account }) => {
  if (!account) {
    return <></>;
  }

  if (!account.isInitialized) {
    return <Initialize />;
  } else {
    return (
      <MemoryRouter>
        <Routes>
          <Route path={AppRoute.home} element={<Home />} />
          <Route path={AppRoute.unlock} element={<Unlock />} />
        </Routes>
      </MemoryRouter>
    );
  }
};

const Provider: FC = () => {
  return (
    <ThemeProvider theme={defaultTheme}>
      <QueryClientProvider client={queryClient}>
        <GlobalStyle />
        <App />
      </QueryClientProvider>
    </ThemeProvider>
  );
};

const App = () => {
  const { isLoading, data } = useAccountState();

  return (
    <Container>
      {isLoading ? <Loading /> : <Content account={data} />}
    </Container>
  );
};

export default Provider;
