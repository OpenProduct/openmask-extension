import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ButtonColumn,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
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
  const { mutate } = useCreateWalletMutation();
  return (
    <Body>
      <LoadingLogo />
      <H1>Welcome to TonMask</H1>
      <ButtonColumn>
        <ButtonPositive onClick={() => mutate()}>Create Wallet</ButtonPositive>
        <ButtonNegative onClick={() => navigate(AppRoute.import)}>
          Import Wallet
        </ButtonNegative>
      </ButtonColumn>
    </Body>
  );
};

export const CreatePassword = () => {
  <Body>
    <H1>Create Password</H1>
    <label>New password</label>
    <input></input>
    <label>Confirm password</label>
    <input></input>I have read and agree to the Terms of Use
    <ButtonColumn>
      <ButtonPositive>Create</ButtonPositive>
    </ButtonColumn>
  </Body>;
};

export const SecretRecoveryPhrase = () => {
  return (
    <Body>
      <H1>Secret Recovery Phrase</H1>
      Your Secret Recovery Phrase makes it easy to back up and restore your
      account. WARNING: Never disclose your Secret Recovery Phrase. Anyone with
      this phrase can take your Ether forever.
      <textarea>phrases</textarea>
      Show button *MetaMask cannot recover your Secret Recovery Phrase. Learn
      more.
      https://metamask.zendesk.com/hc/en-us/articles/360015489591-Basic-Safety-Tips
      Never share your Secret Recovery Phrase with anyone The MetaMask team will
      never ask for your Secret Recovery Phrase Always keep your Secret Recovery
      Phrase in a secure and secret place
      <ButtonRow>
        <ButtonNegative>Skip</ButtonNegative>
        <ButtonPositive>Continue</ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
