import styled from "styled-components";
import { Container } from "../components/Components";
import { Logo } from "../components/Logo";
import { Header } from "./Header";

const Body = styled(Container)`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Home = () => {
  return (
    <>
      <Header />
      <Body>
        <Logo />
        Home Page
      </Body>
    </>
  );
};
