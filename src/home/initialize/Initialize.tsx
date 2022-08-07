import styled from "styled-components";
import {
  ButtonColumn,
  ButtonNegative,
  ButtonPositive,
  Container,
  H1,
} from "../../components/Components";
import { LoadingLogo } from "../../components/Logo";
import { Header } from "../Header";

const Body = styled(Container)`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Initialize = () => {
  return (
    <>
      <Header />
      <Body>
        <LoadingLogo />
        <H1>New to TON?</H1>
        <ButtonColumn>
          <ButtonPositive>Create Wallet</ButtonPositive>
          <ButtonNegative>Import Wallet</ButtonNegative>
        </ButtonColumn>
      </Body>
    </>
  );
};
