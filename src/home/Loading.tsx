import styled from "styled-components";
import { Logo } from "../components/Logo";

const AppHeader = styled.header`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  color: white;

  text-align: center;
`;

export const Loading = () => {
  return (
    <AppHeader>
      <Logo />
      <p>Loading</p>
    </AppHeader>
  );
};
