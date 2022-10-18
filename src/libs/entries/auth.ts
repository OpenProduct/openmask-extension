import { AuthenticatorTransportFuture } from "@simplewebauthn/typescript-types";

export type AuthConfiguration = AuthPassword | WebAuthn;

export interface AuthPassword {
  kind: "password";
}

export interface WebAuthn {
  kind: "webauthn";
  credentialId: string;
  transports?: AuthenticatorTransportFuture[];
}

export const DefaultAuthPasswordConfig: AuthPassword = {
  kind: "password",
};
