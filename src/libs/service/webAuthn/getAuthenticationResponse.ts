import { AuthenticationCredentialJSON } from "@simplewebauthn/typescript-types";
import base64url from "base64url";
import { WebAuthn } from "../../entries/auth";
import parseAuthenticatorData, {
  ParsedAuthenticatorData,
} from "./helpers/parseAuthenticatorData";

export const getAuthenticationResponse = ({
  response,
}: AuthenticationCredentialJSON) => {
  const authDataBuffer = base64url.toBuffer(response.authenticatorData);
  const parsedAuthData = parseAuthenticatorData(authDataBuffer);
  const { rpIdHash, flags, counter } = parsedAuthData;

  return parsedAuthData;
};

export const verifyAuthenticationResponse = (
  authenticator: ParsedAuthenticatorData,
  storedData: WebAuthn
) => {
  // Error out when the counter in the DB is greater than or equal to the counter in the
  // dataStruct. It's related to how the authenticator maintains the number of times its been
  // used for this client. If this happens, then someone's somehow increased the counter
  // on the device without going through this site

  if (
    (authenticator.counter > 0 || storedData.counter > 0) &&
    authenticator.counter <= storedData.counter
  ) {
    throw new Error(
      `Response counter value ${authenticator.counter} was lower than expected ${storedData.counter}`
    );
  }

  // Here ideally have to be verify signature by public key, by I don't know how to do it in a browser.
  // For my perspective it could be done only in service.

  return { newCounter: authenticator.counter };
};
