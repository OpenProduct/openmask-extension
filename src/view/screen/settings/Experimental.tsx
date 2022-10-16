import { browserSupportsWebAuthn } from "@simplewebauthn/browser";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Body, ButtonNegative, H1 } from "../../components/Components";
import { HomeButton } from "../../components/HomeButton";
import { AppRoute } from "../../routes";
import { useAuthConfiguration } from "./api";
import { SettingsRoutes } from "./Settings";

const Quote = styled.div`
  padding: 5px 0;
`;

export const WebAuthn = () => {
  const navigate = useNavigate();

  const supported = useMemo<boolean>(() => browserSupportsWebAuthn(), []);

  const { data } = useAuthConfiguration();
  const isEnabled = data?.kind == "webauthn";

  if (!supported) {
    return (
      <>
        <ButtonNegative disabled={true}>Enable Biometric Auth</ButtonNegative>
        <Quote>It seems this browser does not support WebAuthn...</Quote>
      </>
    );
  }

  return (
    <>
      <ButtonNegative
        disabled={isEnabled}
        onClick={() => navigate(`..${SettingsRoutes.webauthn}`)}
      >
        Enable Biometric Authentication
      </ButtonNegative>
      <Quote>
        Enable biometric wallet authentication with WebAuthn. WebAuthn is a
        browser API that enables the use of physical, cryptographically-secure
        hardware "authenticators" to provide stronger replacements to passwords.
      </Quote>
    </>
  );
};

export const ExperimentalSettings = () => {
  return (
    <>
      <HomeButton path={AppRoute.settings} text="Back to Settings" />
      <Body>
        <H1>Experimental</H1>

        <WebAuthn />
      </Body>
    </>
  );
};
