import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthPassword } from "../../../../libs/entries/auth";
import {
  Body,
  ButtonColumn,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Center,
  ErrorMessage,
  Gap,
  H1,
  Text,
} from "../../../components/Components";
import { Fingerprint } from "../../../components/Fingerprint";
import { InputField } from "../../../components/InputField";
import { sendBackground } from "../../../event";
import { AppRoute } from "../../../routes";
import { useAuthorizationMigration, useChangePasswordMigration } from "./api";

export const WebAuthnDisableMigration = () => {
  const navigate = useNavigate();

  const [start, setStart] = useState(false);
  const [isDone, setDone] = useState(false);

  const [oldPassword, setOldPassword] = useState("");

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const {
    mutateAsync: authorizationAsync,
    error: authorizationError,
    reset: authorizationReset,
    isLoading: isAuthorization,
  } = useAuthorizationMigration();

  const {
    mutateAsync: changeAsync,
    error: changeError,
    reset: changeReset,
    isLoading: isChanging,
  } = useChangePasswordMigration();

  const onStart = useCallback(async () => {
    setStart(true);

    authorizationReset();

    setOldPassword(await authorizationAsync());
  }, []);

  const onNext = async () => {
    changeReset();
    const configuration: AuthPassword = {
      kind: "password",
    };
    await changeAsync({ oldPassword, password, confirm, configuration });
    setDone(true);
  };

  const onCancel = useCallback(() => {
    navigate(AppRoute.settings);
  }, []);

  const onLock = useCallback(() => {
    sendBackground.message("lock");
  }, []);

  return (
    <Body>
      <H1>Disable Biometric Authentication</H1>
      <Gap />
      {isAuthorization && (
        <div>
          <Center>
            <Text>Step 1 of 2 - Authorization</Text>
          </Center>
          <Fingerprint />
        </div>
      )}
      {oldPassword && !isDone && (
        <div>
          <Center>
            <Text>Step 2 of 2 - New Password</Text>
          </Center>
          <InputField
            label="New password"
            type="password"
            disabled={isChanging}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <InputField
            label="Confirm password"
            type="password"
            disabled={isChanging}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            error={changeError}
          />
        </div>
      )}
      {isDone && (
        <div>
          <Center>
            <Text>New Password set!</Text>
          </Center>
        </div>
      )}
      <Gap />
      {authorizationError && (
        <ErrorMessage>{authorizationError.message}</ErrorMessage>
      )}

      {!isDone && (
        <ButtonRow>
          <ButtonNegative disabled={start} onClick={onCancel}>
            Cancel
          </ButtonNegative>
          {oldPassword ? (
            <ButtonPositive disabled={isChanging} onClick={onNext}>
              Save
            </ButtonPositive>
          ) : (
            <ButtonPositive disabled={start} onClick={onStart}>
              Disable
            </ButtonPositive>
          )}
        </ButtonRow>
      )}
      {isDone && (
        <ButtonColumn>
          <ButtonPositive onClick={onLock}>Lock Account</ButtonPositive>
        </ButtonColumn>
      )}
    </Body>
  );
};
