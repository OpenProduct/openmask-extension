import { useState } from "react";
import styled from "styled-components";
import {
  ButtonColumn,
  ButtonPositive,
  Center,
  H1,
} from "../../components/Components";
import { InputField } from "../../components/InputField";
import { LoadingLogo } from "../../components/Logo";
import { useUnlockMutation } from "./api";

const Body = styled.form`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 ${(props) => props.theme.padding};
`;

export const Unlock = () => {
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
