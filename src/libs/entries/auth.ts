import {
  AuthenticationCredentialJSON,
  AuthenticatorTransportFuture,
} from "@simplewebauthn/typescript-types";

export type AuthConfiguration = AuthPassword | WebAuthn;

export interface AuthPassword {
  kind: "password";
}

export interface WebAuthn {
  kind: "webauthn";
  counter: number;
  credentialsId: string;
  credentialPublicKey: string;
  transports?: AuthenticatorTransportFuture[];
}

export const DefaultAuthPasswordConfig: AuthPassword = {
  kind: "password",
};

export interface VerifyAuthenticationResponseJSON {
  credential: AuthenticationCredentialJSON;
  expectedChallenge: string;
  expectedOrigin: string;
  expectedRPID: string;
  authenticator: {
    credentialPublicKey: string;
    credentialID: string;
    counter: number;
    transports?: AuthenticatorTransportFuture[];
  };
}
