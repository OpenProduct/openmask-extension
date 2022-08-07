import styled from "styled-components";
import { LoadingLogo } from "../components/Logo";

const AppHeader = styled.header`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: calc(10px + 2vmin);
  text-align: center;
`;

export const Loading = () => {
  return (
    <AppHeader>
      <LoadingLogo />
      <p>Loading</p>
    </AppHeader>
  );
};
