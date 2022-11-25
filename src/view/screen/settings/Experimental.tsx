import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Logger } from "../../../libs/logger";
import { Body, ButtonNegative, H1 } from "../../components/Components";
import { HomeButton } from "../../components/HomeButton";
import { AppRoute } from "../../routes";
import { useAuthConfiguration } from "./api";
import { SettingsRoutes } from "./route";

const Quote = styled.div`
  padding: 5px 0;
`;

function browserSupportsWebAuthn() {
  if (window.PublicKeyCredential) {
    Logger.log("Supported.");
    return true;
  } else {
    Logger.log("Not supported.");
    return false;
  }
}

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

  if (isEnabled) {
    return (
      <ButtonNegative
        onClick={() => navigate(`..${SettingsRoutes.disableWebAuthn}`)}
      >
        Disable Biometric Authentication
      </ButtonNegative>
    );
  } else {
    return (
      <>
        <ButtonNegative
          onClick={() => navigate(`..${SettingsRoutes.enableWebAuthn}`)}
        >
          Enable Biometric Authentication
        </ButtonNegative>
        <Quote>
          Enable biometric wallet authentication with WebAuthn. WebAuthn is a
          browser API that enables the use of physical, cryptographically-secure
          hardware "authenticators" to provide stronger replacements to
          passwords.
        </Quote>
      </>
    );
  }
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
