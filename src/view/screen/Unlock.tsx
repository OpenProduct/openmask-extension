import { useState } from "react";
import styled from "styled-components";
import {
  ButtonColumn,
  ButtonNegative,
  ErrorText,
  H1,
  Input,
} from "../components/Components";
import { LoadingLogo } from "../components/Logo";
import { useUnlockMutation } from "../lib/state/password";

const Body = styled.header`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 ${(props) => props.theme.padding};
`;

const Center = styled.div`
  text-align: center;
`;

export const Unlock = () => {
  const [password, setPassword] = useState("");

  const { mutateAsync, reset, error } = useUnlockMutation();

  const unlock = async () => {
    reset();
    await mutateAsync(password);
  };

  return (
    <Body>
      <ButtonColumn>
        <LoadingLogo />
        <Center>
          <H1>Welcome Back!</H1>
        </Center>
        <div>
          <label>Password</label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <ErrorText>Invalid Password</ErrorText>}
        </div>

        <ButtonNegative onClick={unlock}>Unlock</ButtonNegative>
      </ButtonColumn>
    </Body>
  );
};
