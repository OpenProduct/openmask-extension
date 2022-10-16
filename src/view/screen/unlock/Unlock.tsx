import { useEffect, useState } from "react";
import styled from "styled-components";
import { delay } from "../../../libs/state/accountService";
import {
  ButtonColumn,
  ButtonPositive,
  Center,
  H1,
  Text,
} from "../../components/Components";
import { Fingerprint } from "../../components/Fingerprint";
import { InputField } from "../../components/InputField";
import { LoadingLogo } from "../../components/Logo";
import { Loading } from "../Loading";
import { useAuthConfiguration } from "../settings/api";
import { useUnlockMutation, useUnlockWebAuthnMutation } from "./api";

const Body = styled.form`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 ${(props) => props.theme.padding};
`;

export const Unlock = () => {
  const { data } = useAuthConfiguration();

  if (!data) {
    return <Loading />;
  }
  if (data.kind === "password") {
    return <UnlockByPassword />;
  }
  return <UnlockByWebAuthn />;
};

const UnlockByWebAuthn = () => {
  const { mutateAsync, reset } = useUnlockWebAuthnMutation();

  useEffect(() => {
    delay(300).then(() => {
      reset();
      mutateAsync();
    });
  }, []);

  return (
    <Body>
      <ButtonColumn>
        <LoadingLogo />
        <Center>
          <H1>Welcome Back!</H1>
        </Center>
        <Fingerprint size="small" />
        <Center>
          <Text>Verify your identity</Text>
        </Center>
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
