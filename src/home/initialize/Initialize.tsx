import styled from "styled-components";
import {
  ButtonColumn,
  ButtonNegative,
  ButtonPositive,
  Container,
  H1,
} from "../../components/Components";
import { LoadingLogo } from "../../components/Logo";
import { useCreateWalletMutation } from "../../lib/state/account";

const Body = styled(Container)`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Initialize = () => {
  const onCreate = useCreateWalletMutation();
  return (
    <Body>
      <LoadingLogo />
      <H1>New to TON?</H1>
      <ButtonColumn>
        <ButtonPositive onClick={onCreate}>Create Wallet</ButtonPositive>
        <ButtonNegative>Import Wallet</ButtonNegative>
      </ButtonColumn>
    </Body>
  );
};
