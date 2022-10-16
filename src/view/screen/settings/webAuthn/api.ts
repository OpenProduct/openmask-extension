import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  VerifiedRegistrationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { RegistrationCredentialJSON } from "@simplewebauthn/typescript-types";
import { useMutation } from "@tanstack/react-query";
import browser from "webextension-polyfill";
import { WebAuthn } from "../../../../libs/entries/auth";
import { networkConfigs } from "../../../../libs/entries/network";
import { delay, reEncryptWallets } from "../../../../libs/state/accountService";
import {
  getAccountState,
  QueryType,
} from "../../../../libs/store/browserStore";
import { askBackground } from "../../../event";
import { askBackgroundPassword } from "../../import/api";

const rpName = "OpenMask Wallet";

const userName = "wallet@openmask.app";

const getHost = () => {
  const url = new URL(browser.runtime.getURL("index.html"));
  const rpID = url.hostname;

  const expectedOrigin = `chrome-extension://${rpID}`;
  const expectedRPID = expectedOrigin;
  return {
    rpID,
    expectedOrigin,
    expectedRPID,
  };
};
function getRandomString(length: number) {
  var randomChars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  var result = "";
  for (var i = 0; i < length; i++) {
    result += randomChars.charAt(
      Math.floor(Math.random() * randomChars.length)
    );
  }
  return result;
}

export interface RegistrationResponse {
  password: string;
  credential: RegistrationCredentialJSON;
  verification: VerifiedRegistrationResponse;
}

export const useRegistrationMigration = () => {
  return useMutation<RegistrationResponse, Error, void>(async () => {
    const password = await askBackgroundPassword();

    const { rpID, expectedOrigin, expectedRPID } = getHost();

    const userID = getRandomString(30);

    const supportedAlgorithmIDs = [
      -8, // EdDSA
      -257, // RSASSA-PKCS1-v1_5 w/ SHA-256
    ];
    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID,
      userName,
      userDisplayName: rpName,
      excludeCredentials: [],
      supportedAlgorithmIDs,
    });

    const credential = await startRegistration(options);

    const verification = await verifyRegistrationResponse({
      credential: credential,
      expectedChallenge: options.challenge,
      expectedOrigin: expectedOrigin,
      expectedRPID: expectedRPID,
    });

    const { verified, registrationInfo } = verification;
    if (!verified || registrationInfo == undefined) {
      throw new Error("The credential are not verified.");
    }

    return {
      password,
      credential,
      verification,
    };
  });
};

export const useVerificationMigration = () => {
  return useMutation<void, Error, RegistrationResponse>(
    async ({ credential, verification, password }) => {
      const { expectedOrigin, expectedRPID } = getHost();

      const { registrationInfo } = verification;
      if (registrationInfo == undefined) {
        throw new Error("The credential are not verified.");
      }

      await delay(500);

      console.log({ credential });
      console.log({ registrationInfo });

      const options = generateAuthenticationOptions({
        allowCredentials: [
          {
            id: registrationInfo.credentialID,
            type: registrationInfo.credentialType,
            transports: credential.transports,
          },
        ],
        userVerification: "required",
      });

      const authentication = await startAuthentication(options);

      const verified = await askBackground<boolean | Error>().message(
        "verifyAuthentication",
        {
          credential: authentication,
          expectedChallenge: options.challenge,
          expectedOrigin: expectedOrigin,
          expectedRPID: expectedRPID,
          authenticator: {
            credentialPublicKey:
              registrationInfo.credentialPublicKey.toString("base64"),
            credentialID: registrationInfo.credentialID.toString("base64"),
            counter: registrationInfo.counter,
            transports: credential.transports,
          },
        }
      );
      //   const authenticator: AuthenticatorDevice = {
      //     credentialPublicKey: registrationInfo.credentialPublicKey,
      //     credentialID: registrationInfo.credentialID,
      //     counter: registrationInfo.counter,
      //     transports: credential.transports,
      //   };

      //   const authenticationResponse = await verifyAuthenticationResponse({
      //     credential: authentication,
      //     expectedChallenge: options.challenge,
      //     expectedOrigin: expectedOrigin,
      //     expectedRPID: expectedRPID,
      //     authenticator,
      //   });

      //   const { authenticationInfo, verified } = authenticationResponse;
      if (verified instanceof Error) {
        throw verified;
      }
      if (!verified) {
        throw new Error("The credential are not verified.");
      }

      const configuration: WebAuthn = {
        kind: "webauthn",
        counter: registrationInfo.counter + 1,
        credentialsId: registrationInfo.credentialID.toString("base64"),
        credentialPublicKey:
          registrationInfo.credentialPublicKey.toString("base64"),
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

      //await batchUpdateStore(batchUpdate);
    }
  );
};
