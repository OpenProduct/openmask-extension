import { useMutation, useQueryClient } from "@tanstack/react-query";
import crypto from "crypto";
import browser from "webextension-polyfill";
import { AuthConfiguration, WebAuthn } from "../../../../libs/entries/auth";
import { networkConfigs } from "../../../../libs/entries/network";
import { encrypt } from "../../../../libs/service/cryptoService";
import { delay, reEncryptWallets } from "../../../../libs/state/accountService";
import {
  batchUpdateStore,
  getAccountState,
  QueryType,
} from "../../../../libs/store/browserStore";
import { getWebAuthnPassword } from "../../../api";
import { askBackgroundPassword } from "../../import/api";

declare global {
  interface AuthenticationExtensionsClientInputs {
    largeBlob?: {
      support?: string;
      write?: Uint8Array;
      read?: boolean;
    };
    credBlob?: Uint8Array; // max 32 bytes
    getCredBlob?: boolean;
    hmacCreateSecret?: boolean;
    hmacGetSecret?: { salt1: Uint8Array }; // 32-byte random data
  }

  interface AuthenticationExtensionsClientOutputs {
    largeBlob?: {
      written?: boolean;
      blob?: Uint8Array;
    };
    credBlob?: boolean;
    hmacCreateSecret?: boolean;
    hmacGetSecret?: { output1: Uint8Array };
  }

  interface AuthenticatorResponse {
    getTransports?: () => AuthenticatorTransport[];
  }
}

const rpName = "OpenMask Wallet";

const userName = "wallet@openmask.app";

export const supportedCOSEAlgorithmIdentifiers: COSEAlgorithmIdentifier[] = [
  // EdDSA (In first position to encourage authenticators to use this over ES256)
  -8,
  // ECDSA w/ SHA-256
  -7,
  // ECDSA w/ SHA-512
  -36,
  // RSASSA-PSS w/ SHA-256
  -37,
  // RSASSA-PSS w/ SHA-384
  -38,
  // RSASSA-PSS w/ SHA-512
  -39,
  // RSASSA-PKCS1-v1_5 w/ SHA-256
  -257,
  // RSASSA-PKCS1-v1_5 w/ SHA-384
  -258,
  // RSASSA-PKCS1-v1_5 w/ SHA-512
  -259,
];

const getHost = () => {
  const url = new URL(browser.runtime.getURL("index.html"));
  const rpID = url.hostname;

  return {
    rpID,
  };
};

export interface RegistrationResponse {
  oldPassword: string;
  password: string;
  credential: PublicKeyCredential;
}

export const useRegistrationMigration = () => {
  return useMutation<RegistrationResponse, Error, void>(async () => {
    const oldPassword = await askBackgroundPassword();

    const { rpID } = getHost();

    const password = crypto.randomBytes(32);

    const options: CredentialCreationOptions = {
      publicKey: {
        challenge: crypto.randomBytes(32),
        rp: {
          name: rpName,
          id: rpID,
        },
        user: {
          id: password,
          name: userName,
          displayName: rpName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          requireResidentKey: true,
          //userVerification: "required",
        },
        extensions: {
          credBlob: password,
          largeBlob: {
            support: "preferred",
          },
          hmacCreateSecret: true,
        },
        timeout: 120000,
        excludeCredentials: [],
      },
    };

    const credential = (await navigator.credentials.create(
      options
    )) as PublicKeyCredential;

    if (!credential) {
      throw new Error("Missing credential");
    }

    console.log({ credential });

    const extensions = credential.getClientExtensionResults();

    console.log(extensions);

    return {
      oldPassword,
      password: password.toString("hex"),
      credential,
    };
  });
};

export const useVerificationMigration = () => {
  return useMutation<ChangePasswordProps, Error, RegistrationResponse>(
    async ({ credential, oldPassword, password }) => {
      await delay(300);

      const transports =
        credential.response &&
        credential.response.getTransports &&
        credential.response.getTransports();

      const credentialId = Buffer.from(credential.rawId).toString("hex");

      const options: CredentialRequestOptions = {
        publicKey: {
          challenge: crypto.randomBytes(32),
          allowCredentials: [
            {
              id: credential.rawId,
              type: "public-key",
              transports,
            },
          ],
          userVerification: "required",
          extensions: {
            getCredBlob: true,
            largeBlob: {
              write: Buffer.from(password, "hex"),
            },
          },
        },
      };

      const assertion = (await navigator.credentials.get(
        options
      )) as PublicKeyCredential;

      if (!assertion) {
        throw new Error("Missing authentication");
      }

      const response = assertion.response as AuthenticatorAssertionResponse;

      console.log(assertion);

      const extensions = assertion.getClientExtensionResults();

      console.log(extensions);

      if (!response.userHandle) {
        throw new Error("Missing stored userHandle");
      }

      if (
        !Buffer.from(password, "hex").equals(Buffer.from(response.userHandle))
      ) {
        throw new Error("Stored blob not equals passed blob");
      }

      const configuration: WebAuthn = {
        kind: "webauthn",
        credentialId,
        transports,
      };

      return {
        oldPassword: oldPassword,
        password: password,
        confirm: password,
        configuration,
      };
    }
  );
};

export const useAuthorizationMigration = () => {
  return useMutation<string, Error, void>(async () => {
    return await getWebAuthnPassword(async (password) => password);
  });
};

interface ChangePasswordProps {
  oldPassword: string;
  password: string;
  confirm: string;
  configuration: AuthConfiguration;
}

export const useChangePasswordMigration = () => {
  const client = useQueryClient();
  return useMutation<void, Error, ChangePasswordProps>(
    async ({ oldPassword, password, confirm, configuration }) => {
      if (password !== confirm) {
        throw new Error("Confirm password incorrect");
      }
      if (password.length <= 5) {
        throw new Error("Password too short");
      }

      const accounts = await Promise.all(
        networkConfigs.map(async (network) => {
          const account = await getAccountState(network.name);
          console.log(account);
          return [
            `${network.name}_${QueryType.account}`,
            await reEncryptWallets(account, oldPassword, password),
          ] as const;
        })
      );
      console.log(accounts);

      const script = await encrypt(password, password);

      console.log(script);

      const batchUpdate = Object.assign(Object.fromEntries(accounts), {
        [QueryType.auth]: configuration,
        [QueryType.script]: script,
      });

      console.log(batchUpdate);

      await batchUpdateStore(batchUpdate);

      await Promise.all(
        Object.keys(batchUpdate).map((key) => client.invalidateQueries([key]))
      );
    }
  );
};
