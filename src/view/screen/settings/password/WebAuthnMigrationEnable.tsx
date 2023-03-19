import { useCallback, useState } from "react";
import { useNavigate } from "react-router-dom";
import { setLockScreen } from "../../../../libs/store/browserStore";
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
import {
  useChangePasswordMigration,
  useLargeBlobMigration,
  useRegistrationMigration,
  useVerificationMigration,
} from "./api";

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
        Enabling the feature required to enter biometrics two or there times.
        For registration and for verification access.
      </Text>
    </>
  );
};

export const WebAuthnEnableMigration = () => {
  const navigate = useNavigate();

  const [total, setTotal] = useState(2);
  const [start, setStart] = useState(false);
  const [isDone, setDone] = useState(false);

  const {
    mutateAsync: registrationAsync,
    error: registrationError,
    reset: registrationReset,
    isLoading: isRegistration,
  } = useRegistrationMigration();

  const {
    mutateAsync: largeBlobAsync,
    error: largeBlobError,
    reset: largeBlobReset,
    isLoading: isLargeBlob,
  } = useLargeBlobMigration();

  const {
    mutateAsync: verificationAsync,
    error: verificationError,
    reset: verificationReset,
    isLoading: isVerification,
  } = useVerificationMigration();

  const {
    mutateAsync: changeAsync,
    error: changeError,
    reset: changeReset,
    isLoading: isChanging,
  } = useChangePasswordMigration();

  const onRegistration = useCallback(async () => {
    setStart(true);

    registrationReset();
    largeBlobReset();
    verificationReset();
    changeReset();

    const result = await registrationAsync();
    if (result.type === "largeBlob") {
      setTotal(3);
      await largeBlobAsync(result);
    }
    const props = await verificationAsync(result);
    await changeAsync(props);
    setDone(true);
  }, []);

  const onCancel = useCallback(() => {
    navigate(AppRoute.settings);
  }, []);

  const onLock = useCallback(async () => {
    await setLockScreen(true);
    sendBackground.message("lock");
  }, []);

  const disabledCancel =
    start &&
    registrationError == null &&
    verificationError == null &&
    changeError == null;

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
      {isLargeBlob && (
        <div>
          <Center>
            <Text>Step 2 of 3 - Store</Text>
          </Center>
          <Fingerprint />
        </div>
      )}
      {(isVerification || isChanging) && (
        <div>
          <Center>
            <Text>
              Step {total} of {total} - Verification
            </Text>
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
      {changeError && <ErrorMessage>{changeError.message}</ErrorMessage>}
      {largeBlobError && <ErrorMessage>{largeBlobError.message}</ErrorMessage>}

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
