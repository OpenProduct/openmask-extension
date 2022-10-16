import { RegistrationCredentialJSON } from "@simplewebauthn/typescript-types";
import base64url from "base64url";
import decodeAttestationObject from "./helpers/decodeAttestationObject";
import parseAuthenticatorData from "./helpers/parseAuthenticatorData";

export const getRegistrationResponse = ({
  response,
}: RegistrationCredentialJSON) => {
  const attestationObject = base64url.toBuffer(response.attestationObject);
  const decodedAttestationObject = decodeAttestationObject(attestationObject);
  const { fmt, authData, attStmt } = decodedAttestationObject;

  const parsedAuthData = parseAuthenticatorData(authData);
  const {
    aaguid,
    rpIdHash,
    flags,
    credentialID,
    counter,
    credentialPublicKey,
  } = parsedAuthData;

  return parsedAuthData;
};
