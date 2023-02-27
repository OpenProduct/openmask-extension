import { FC, useEffect, useState } from "react";
import styled from "styled-components";
import { delay } from "../../../libs/state/accountService";
import {
  ButtonColumn,
  ButtonPositive,
  Center,
  H1,
} from "../../components/Components";
import { FingerprintIcon } from "../../components/Icons";
import { InputField } from "../../components/InputField";
import { LoadingLogo } from "../../components/Logo";
import { Loading } from "../Loading";
import { useAuthConfiguration } from "../settings/api";
import { useUnlockMutation, useUnlockWebAuthnMutation } from "./api";

const Body = styled.form`
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 ${(props) => props.theme.padding};
`;

export const Unlock: FC<{ justOpen: boolean }> = ({ justOpen }) => {
  const { data } = useAuthConfiguration();

  if (!data) {
    return <Loading />;
  }
  if (data.kind === "password") {
    return <UnlockByPassword />;
  }
  return <UnlockByWebAuthn justOpen={justOpen} />;
};

const Block = styled.div`
  height: 40px;
`;
const UnlockByWebAuthn: FC<{ justOpen: boolean }> = ({ justOpen }) => {
  const { mutateAsync, reset, isLoading } = useUnlockWebAuthnMutation();

  const unlock = () => {
    reset();
    mutateAsync();
  };

  useEffect(() => {
    if (justOpen) {
      delay(100).then(() => {
        unlock();
      });
    }
  }, []);

  return (
    <Body onSubmit={unlock}>
      <ButtonColumn>
        <LoadingLogo />
        <Center>
          <H1>Welcome Back!</H1>
        </Center>
        <Block />
        <ButtonPositive type="submit" disabled={isLoading}>
          Verify your identity <FingerprintIcon />
        </ButtonPositive>
      </ButtonColumn>
    </Body>
  );
};

const UnlockByPassword = () => {
  const [password, setPassword] = useState("");

  const { mutateAsync, reset, error, isLoading } = useUnlockMutation();

  const unlock = async () => {
    reset();
    await mutateAsync(password);
  };

  return (
    <Body onSubmit={unlock}>
      <ButtonColumn>
        <LoadingLogo />
        <Center>
          <H1>Welcome Back!</H1>
        </Center>
        <div>
          <InputField
            label="Password"
            error={error}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <ButtonPositive type="submit" disabled={isLoading}>
          Unlock
        </ButtonPositive>
      </ButtonColumn>
    </Body>
  );
};
