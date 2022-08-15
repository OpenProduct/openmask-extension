import { useState } from "react";
import styled from "styled-components";
import {
  ButtonColumn,
  ButtonNegative,
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

const Label = styled.label``;
const Error = styled.div`
  color: ${(props) => props.theme.red};
  font-size: medium;
  padding-top: 3px;
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
          <Label>Password</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Error>Invalid Password</Error>}
        </div>

        <ButtonNegative onClick={unlock}>Unlock</ButtonNegative>
      </ButtonColumn>
    </Body>
  );
};
