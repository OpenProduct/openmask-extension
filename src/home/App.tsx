import { MemoryRouter, Route, Routes } from "react-router-dom";
import styled, { createGlobalStyle, ThemeProvider } from "styled-components";
import { useAppStore } from "../lib/storage";
import defaultTheme from "../styles/defailtTheme";
import { Home } from "./Home";
import { Loading } from "./Loading";
import { AppRoute } from "./routes";
import { AppStateContext } from "./storeContext";
import { Unlock } from "./Unlock";

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
  background-color: #282c34;
  width: 375px;
  height: 600px;
  min-height: 100vh;
`;

const Content = () => {
  return (
    <MemoryRouter>
      <Routes>
        <Route path={AppRoute.home} element={<Home />} />
        <Route path={AppRoute.unlock} element={<Unlock />} />
      </Routes>
    </MemoryRouter>
  );
};

function App() {
  const { loading, store } = useAppStore();

  return (
    <ThemeProvider theme={defaultTheme}>
      <GlobalStyle />
      <Container>
        {loading ? (
          <Loading />
        ) : (
          <AppStateContext.Provider value={store!}>
            <Content />
          </AppStateContext.Provider>
        )}
      </Container>
    </ThemeProvider>
  );
}

export default App;
