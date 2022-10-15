import { useState } from "react";
import {
  Body,
  ButtonColumn,
  ButtonNegative,
  Gap,
  H1,
} from "../../../components/Components";
import { Fingerprint } from "../../../components/Fingerprint";
import { RegistrationResponse, useRegistrationMigration } from "./api";

export const WebAuthnMigration = () => {
  const [registration, setRegistration] = useState<
    RegistrationResponse | undefined
  >(undefined);

  const {
    mutateAsync,
    error,
    reset,
    isLoading: isRegistration,
  } = useRegistrationMigration();

  const onRegistration = () => {};

  return (
    <Body>
      <H1>Enable WebAuthn</H1>

      <Gap />
      <Fingerprint />
      <Gap />

      <ButtonColumn>
        <ButtonNegative onClick={onRegistration}>Start</ButtonNegative>
      </ButtonColumn>
    </Body>
  );
};
