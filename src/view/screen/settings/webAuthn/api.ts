import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationCredentialJSON,
} from "@simplewebauthn/typescript-types";
import { useMutation } from "@tanstack/react-query";
import base64url from "base64url";
import crypto from "crypto";
import browser from "webextension-polyfill";
import { WebAuthn } from "../../../../libs/entries/auth";
import { networkConfigs } from "../../../../libs/entries/network";
import { getAuthenticationResponse } from "../../../../libs/service/webAuthn/getAuthenticationResponse";
import { getRegistrationResponse } from "../../../../libs/service/webAuthn/getRegistrationResponse";
import { ParsedAuthenticatorData } from "../../../../libs/service/webAuthn/helpers/parseAuthenticatorData";
import { delay, reEncryptWallets } from "../../../../libs/state/accountService";
import {
  batchUpdateStore,
  getAccountState,
  QueryType,
} from "../../../../libs/store/browserStore";
import { askBackgroundPassword } from "../../import/api";

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
  password: string;
  credential: RegistrationCredentialJSON;
  authenticator: ParsedAuthenticatorData;
}

export const useRegistrationMigration = () => {
  return useMutation<RegistrationResponse, Error, void>(async () => {
    const password = await askBackgroundPassword();

    const { rpID } = getHost();

    const userID = crypto.randomBytes(32).toString("hex");
    const challenge = crypto.randomBytes(32).toString("hex");

    const options: PublicKeyCredentialCreationOptionsJSON = {
      challenge: challenge,
      rp: {
        name: rpName,
        id: rpID,
      },
      user: {
        id: userID,
        name: userName,
        displayName: rpName,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 },
      ],
      excludeCredentials: [],
    };

    const credential = await startRegistration(options);

    console.log({ credential });

    const authenticator = await getRegistrationResponse(credential);

    console.log({ authenticator });

    return {
      password,
      credential,
      authenticator,
    };
  });
};

export const useVerificationMigration = () => {
  return useMutation<void, Error, RegistrationResponse>(
    async ({ credential, password, authenticator }) => {
      await delay(500);

      const { credentialID, credentialPublicKey } = authenticator;
      if (!credentialID || !credentialPublicKey) {
        throw new Error("Invalid authenticator data");
      }

      const challenge = crypto.randomBytes(32).toString("hex");
      const options: PublicKeyCredentialRequestOptionsJSON = {
        challenge,
        allowCredentials: [
          {
            id: base64url.encode(credentialID),
            type: "public-key",
            transports: credential.transports,
          },
        ],
        userVerification: "required",
      };
      const authentication = await startAuthentication(options);

      console.log({ authentication });

      try {
        const response = await getAuthenticationResponse(authentication);
        console.log({ response });
      } catch (e) {
        console.log(e);
      }

      const configuration: WebAuthn = {
        kind: "webauthn",
        credentialsId: base64url.encode(credentialID),
        credentialPublicKey: base64url.encode(credentialPublicKey),
        counter: authenticator.counter,
        transports: credential.transports,
      };

      const signature = authentication.response.signature;

      console.log({ signature });

      const accounts = await Promise.all(
        networkConfigs.map(async (network) => {
          const account = await getAccountState(network.name);
          return [
            `${network.name}_${QueryType.account}`,
            await reEncryptWallets(account, password, signature),
          ] as const;
        })
      );

      const batchUpdate = Object.assign(Object.fromEntries(accounts), {
        [QueryType.auth]: configuration,
        [QueryType.script]: undefined,
      });

      console.log(batchUpdate);

      await batchUpdateStore(batchUpdate);
    }
  );
};
