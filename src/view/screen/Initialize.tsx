import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ButtonColumn,
  ButtonNegative,
  ButtonPositive,
  Container,
  ErrorText,
  H1,
  Input,
} from "../components/Components";
import { LoadingLogo } from "../components/Logo";
import { useCreatePasswordMutation } from "../lib/state/password";
import { AppRoute } from "../routes";
import { ConnectRoutes } from "./connect/ConnectWallet";

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
  return (
    <Body>
      <LoadingLogo />
      <H1>Welcome to TonMask</H1>
      <ButtonColumn>
        <ButtonPositive
          onClick={() => navigate(`${AppRoute.connect}${ConnectRoutes.create}`)}
        >
          Create Wallet
        </ButtonPositive>
        <ButtonNegative
          onClick={() => navigate(`${AppRoute.connect}${ConnectRoutes.import}`)}
        >
          Import Wallet
        </ButtonNegative>
      </ButtonColumn>
    </Body>
  );
};

export const CreatePassword = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const { mutateAsync, reset, isLoading, error } = useCreatePasswordMutation();

  const onCreate = async () => {
    reset();
    await mutateAsync([password, confirm]);
  };

  return (
    <Body>
      <LoadingLogo />
      <H1>Create Password</H1>
      <ButtonColumn>
        <div>
          <label>New password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div>
          <label>Confirm password</label>
          <Input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {error && <ErrorText>{error.message}</ErrorText>}
        </div>
        <ButtonPositive onClick={onCreate} disabled={isLoading}>
          Create
        </ButtonPositive>
      </ButtonColumn>
    </Body>
  );
};
