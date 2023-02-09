import { useMutation, useQueryClient } from "@tanstack/react-query";
import crypto from "crypto";
import browser from "webextension-polyfill";
import { AuthConfiguration, WebAuthn } from "../../../../libs/entries/auth";
import { Logger } from "../../../../libs/logger";
import { encrypt } from "../../../../libs/service/cryptoService";
import { delay, reEncryptWallets } from "../../../../libs/state/accountService";
import {
  batchUpdateStore,
  getAccountState,
  getNetworkConfig,
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
      supported?: boolean;
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

const getHost = () => {
  const url = new URL(browser.runtime.getURL("index.html"));
  const rpID = url.hostname;

  return {
    rpID,
  };
};

export interface RegistrationResponse {
  oldPassword: string;
  type: "largeBlob" | "credBlob" | "userHandle";
  password: {
    largeBlob: string;
    credBlob: string;
    userHandle: string;
  };
  credential: PublicKeyCredential;
}

export const useRegistrationMigration = () => {
  return useMutation<RegistrationResponse, Error, void>(async () => {
    const oldPassword = await askBackgroundPassword();

    const { rpID } = getHost();

    const userHandle = crypto.randomBytes(32);
    const credBlob = crypto.randomBytes(32);
    const largeBlob = crypto.randomBytes(64);

    const options: CredentialCreationOptions = {
      publicKey: {
        challenge: crypto.randomBytes(32),
        rp: {
          name: rpName,
          id: rpID,
        },
        user: {
          id: userHandle,
          name: userName,
          displayName: rpName,
        },
        pubKeyCredParams: [
          { type: "public-key", alg: -7 },
          { type: "public-key", alg: -257 },
        ],
        authenticatorSelection: {
          requireResidentKey: true,
        },
        extensions: {
          credBlob: credBlob,
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

    Logger.log({ credential });

    const extensions = credential.getClientExtensionResults();

    Logger.log(extensions);

    const type = extensions.largeBlob?.supported
      ? "largeBlob"
      : extensions.credBlob
      ? "credBlob"
      : "userHandle";

    const response: RegistrationResponse = {
      oldPassword,
      type,
      password: {
        largeBlob: largeBlob.toString("hex"),
        credBlob: credBlob.toString("hex"),
        userHandle: userHandle.toString("hex"),
      },
      credential,
    };
    return response;
  });
};

export const useLargeBlobMigration = () => {
  return useMutation<void, Error, RegistrationResponse>(
    async ({ credential, password }) => {
      await delay(300);

      const transports =
        credential.response &&
        credential.response.getTransports &&
        credential.response.getTransports();

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
            largeBlob: {
              write: new Uint8Array(Buffer.from(password.largeBlob, "hex")),
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

      const extensions = assertion.getClientExtensionResults();

      if (!extensions.largeBlob?.written) {
        throw new Error("Failed write large blob");
      }
    }
  );
};

export const useVerificationMigration = () => {
  return useMutation<ChangePasswordProps, Error, RegistrationResponse>(
    async ({ credential, oldPassword, password, type }) => {
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
              read: true,
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

      Logger.log(assertion);

      const extensions = assertion.getClientExtensionResults();

      Logger.log(extensions);

      let result: string | undefined = undefined;
      switch (type) {
        case "largeBlob": {
          if (!extensions.largeBlob?.blob) {
            throw new Error("Missing stored largeBlob");
          }
          if (
            !Buffer.from(password.largeBlob, "hex").equals(
              Buffer.from(extensions.largeBlob?.blob)
            )
          ) {
            throw new Error("Stored blob not equals passed blob");
          }
          result = password.largeBlob;
          break;
        }
        case "userHandle": {
          if (!response.userHandle) {
            throw new Error("Missing stored userHandle");
          }
          if (
            !Buffer.from(password.userHandle, "hex").equals(
              Buffer.from(response.userHandle)
            )
          ) {
            throw new Error("Stored blob not equals passed blob");
          }
          result = password.userHandle;
          break;
        }
      }

      if (!result) {
        throw new Error("Missing stored blob");
      }

      const configuration: WebAuthn = {
        kind: "webauthn",
        type,
        credentialId,
        transports,
      };

      Logger.log(configuration);

      const props: ChangePasswordProps = {
        oldPassword: oldPassword,
        password: result,
        confirm: result,
        configuration,
      };
      return props;
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
      const networks = await getNetworkConfig();

      const accounts = await Promise.all(
        networks.map(async (network) => {
          const account = await getAccountState(network.name);
          Logger.log(account);
          return [
            `${network.name}_${QueryType.account}`,
            await reEncryptWallets(account, oldPassword, password),
          ] as const;
        })
      );
      Logger.log(accounts);

      const script = await encrypt(password, password);

      Logger.log(script);

      const batchUpdate = Object.assign(Object.fromEntries(accounts), {
        [QueryType.auth]: configuration,
        [QueryType.script]: script,
      });

      Logger.log(batchUpdate);

      await batchUpdateStore(batchUpdate);

      await Promise.all(
        Object.keys(batchUpdate).map((key) => client.invalidateQueries([key]))
      );
    }
  );
};
