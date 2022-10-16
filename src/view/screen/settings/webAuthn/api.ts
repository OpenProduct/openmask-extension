import { startAuthentication } from "@simplewebauthn/browser";
import {
  generateAuthenticationOptions,
  VerifiedRegistrationResponse,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server";
import {
  AuthenticatorDevice,
  RegistrationCredentialJSON,
} from "@simplewebauthn/typescript-types";
import { useMutation } from "@tanstack/react-query";
import crypto from "crypto";
import browser from "webextension-polyfill";
import { WebAuthn } from "../../../../libs/entries/auth";
import { networkConfigs } from "../../../../libs/entries/network";
import { delay, reEncryptWallets } from "../../../../libs/state/accountService";
import {
  getAccountState,
  QueryType,
} from "../../../../libs/store/browserStore";
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

export interface RegistrationResponse {
  password: string;
  credential: RegistrationCredentialJSON;
  verification: VerifiedRegistrationResponse;
}

export const useRegistrationMigration = () => {
  return useMutation<void, Error, void>(async () => {
    const password = await askBackgroundPassword();

    const { rpID, expectedOrigin, expectedRPID } = getHost();

    const userID = crypto.randomBytes(32);
    const challenge = crypto.randomBytes(32);

    const options: CredentialCreationOptions = {
      publicKey: {
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
      },
    };

    const result = await navigator.credentials.create(options);

    if (!result) {
      throw new Error("Unable to create credentials");
    }
    console.log(result);
    // const options = generateRegistrationOptions({
    //   rpName,
    //   rpID,
    //   userID,
    //   userName,
    //   userDisplayName: rpName,
    //   excludeCredentials: [],
    //   attestationType: "direct",
    // });

    // const credential = await startRegistration(options);

    // const verification = await verifyRegistrationResponse({
    //   credential: credential,
    //   expectedChallenge: options.challenge,
    //   expectedOrigin: expectedOrigin,
    //   expectedRPID: expectedRPID,
    // });

    // const { verified, registrationInfo } = verification;
    // if (!verified || registrationInfo == undefined) {
    //   throw new Error("The credential are not verified.");
    // }

    // return {
    //   password,
    //   credential,
    //   verification,
    // };
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

      try {
        //   const verified = await askBackground<boolean | Error>(
        //     5 * 60 * 1000
        //   ).message("verifyAuthentication", {
        //     credential: authentication,
        //     expectedChallenge: options.challenge,
        //     expectedOrigin: expectedOrigin,
        //     expectedRPID: expectedRPID,
        //     authenticator: {
        //       credentialPublicKey:
        //         registrationInfo.credentialPublicKey.toString("base64"),
        //       credentialID: registrationInfo.credentialID.toString("base64"),
        //       counter: registrationInfo.counter,
        //       transports: credential.transports,
        //     },
        //   });
        const authenticator: AuthenticatorDevice = {
          credentialPublicKey: registrationInfo.credentialPublicKey,
          credentialID: registrationInfo.credentialID,
          counter: registrationInfo.counter,
          transports: credential.transports,
        };

        const authenticationResponse = await verifyAuthenticationResponse({
          credential: authentication,
          expectedChallenge: options.challenge,
          expectedOrigin: expectedOrigin,
          expectedRPID: expectedRPID,
          authenticator,
        });

        const { verified } = authenticationResponse;
        console.log({ verified });
      } catch (e) {
        console.log({ e });
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
