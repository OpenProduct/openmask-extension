export type AuthConfiguration = AuthPassword | WebAuthn;

export interface AuthPassword {
  kind: "password";
}

export interface WebAuthn {
  kind: "webauthn";
  credentialId: string;
  transports?: AuthenticatorTransport[];
}

export const DefaultAuthPasswordConfig: AuthPassword = {
  kind: "password",
};
