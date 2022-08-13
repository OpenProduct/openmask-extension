import { useNavigate } from "react-router-dom";
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
import { AppRoute } from "../routes";

const Body = styled(Container)`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Initialize = () => {
  const navigate = useNavigate();
  const onCreate = useCreateWalletMutation();
  return (
    <Body>
      <LoadingLogo />
      <H1>New to TON?</H1>
      <ButtonColumn>
        <ButtonPositive onClick={onCreate}>Create Wallet</ButtonPositive>
        <ButtonNegative onClick={() => navigate(AppRoute.import)}>
          Import Wallet
        </ButtonNegative>
      </ButtonColumn>
    </Body>
  );
};
