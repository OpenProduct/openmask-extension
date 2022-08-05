import styled, { ThemeProvider } from "styled-components";
import { Logo } from "./Logo";
import defaultTheme from "./styles/defailtTheme";

const Container = styled.div`
  text-align: center;
`;

const AppHeader = styled.header`
  background-color: #282c34;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;
`;

const Link = styled.a`
  color: #61dafb;
`;

function App() {
  return (
    <ThemeProvider theme={defaultTheme}>
      <Container>
        <AppHeader>
          <Logo />
          <p>
            Edit <code>src/App.tsx</code> and save to reload.
          </p>
          <Link
            href="https://reactjs.org"
            target="_blank"
            rel="noopener noreferrer"
          >
            Learn React
          </Link>
        </AppHeader>
      </Container>
    </ThemeProvider>
  );
}

export default App;
