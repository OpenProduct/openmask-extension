import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { sendBackground } from "../../../event";
import { AppRoute } from "../../../routes";
import { useRegistrationMigration, useVerificationMigration } from "./api";

const Note = () => {
  return (
    <>
      <Text>
        WebAuthn is a browser API that enables the use of physical,
        cryptographically-secure hardware "authenticators" to provide stronger
        replacements to passwords.
      </Text>
      <Text>
        The feature "Biometric Authentication" is experimental and it will
        re-encrypt mnemonic phrases. Back up your mnemonic phrases to not lost
        access to wallets.
      </Text>
      <Text>
        Enabling the feature required to enter biometrics two times. First for
        registration and second for verification access.
      </Text>
    </>
  );
};
export const WebAuthnMigration = () => {
  const navigate = useNavigate();

  const [start, setStart] = useState(false);
  const [isDone, setDone] = useState(false);

  const {
    mutateAsync: registrationAsync,
    error: registrationError,
    reset: registrationReset,
    isLoading: isRegistration,
  } = useRegistrationMigration();

  const {
    mutateAsync: verificationAsync,
    error: verificationError,
    reset: verificationReset,
    isLoading: isVerification,
  } = useVerificationMigration();

  const onRegistration = useCallback(async () => {
    setStart(true);

    registrationReset();
    verificationReset();

    const result = await registrationAsync();
    //await verificationAsync(result);
    setDone(true);
  }, []);

  const onCancel = useCallback(() => {
    navigate(AppRoute.settings);
  }, []);

  const onLock = useCallback(() => {
    sendBackground.message("lock");
  }, []);

  const disabledCancel =
    start && registrationError == null && verificationError == null;

  return (
    <Body>
      <H1>Enable Biometric Authentication</H1>
      {!start && <Note />}
      <Gap />
      {isRegistration && (
        <div>
          <Center>
            <Text>Step 1 of 2 - Registration</Text>
          </Center>
          <Fingerprint />
        </div>
      )}
      {isVerification && (
        <div>
          <Center>
            <Text>Step 2 of 2 - Verification</Text>
          </Center>
          <Fingerprint />
        </div>
      )}
      {isDone && (
        <div>
          <Center>
            <Text>Biometric Authentication Enabled!</Text>
          </Center>
          <Fingerprint />
        </div>
      )}
      <Gap />
      {registrationError && (
        <ErrorMessage>{registrationError.message}</ErrorMessage>
      )}
      {verificationError && (
        <ErrorMessage>{verificationError.message}</ErrorMessage>
      )}

      {!isDone && (
        <ButtonRow>
          <ButtonNegative disabled={disabledCancel} onClick={onCancel}>
            Cancel
          </ButtonNegative>
          <ButtonPositive disabled={start} onClick={onRegistration}>
            Enable
          </ButtonPositive>
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
