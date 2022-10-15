import { startRegistration } from "@simplewebauthn/browser";
import {
  generateRegistrationOptions,
  VerifiedRegistrationResponse,
  verifyRegistrationResponse,
} from "@simplewebauthn/server";
import { RegistrationCredentialJSON } from "@simplewebauthn/typescript-types";
import { useMutation } from "@tanstack/react-query";
import browser from "webextension-polyfill";

const rpName = "OpenMask Wallet";

const userName = "wallet@openmask.app";

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
  credential: RegistrationCredentialJSON;
  verification: VerifiedRegistrationResponse;
}

export const useRegistrationMigration = () => {
  return useMutation<RegistrationResponse, Error, void>(async () => {
    const url = new URL(browser.runtime.getURL("index.html"));
    const rpID = url.hostname;

    const userID = getRandomString(30);

    const options = generateRegistrationOptions({
      rpName,
      rpID,
      userID,
      userName,
      userDisplayName: rpName,
      excludeCredentials: [],
    });

    const credential = await startRegistration(options);

    const verification = await verifyRegistrationResponse({
      credential: credential,
      expectedChallenge: options.challenge,
      expectedOrigin: `chrome-extension://${rpID}`,
      expectedRPID: rpID,
    });

    return {
      credential,
      verification,
    };
  });
};
