import { useMutation } from "@tanstack/react-query";
import crypto from "crypto";
import { decrypt } from "../../../libs/service/cryptoService";
import {
  getAuthConfiguration,
  getScript,
} from "../../../libs/store/browserStore";
import { getWebAuthnPassword } from "../../api";
import { sendBackground } from "../../event";

export const useUnlockMutation = () => {
  return useMutation<void, Error, string>(async (value) => {
    const script = await getScript();
    if (script == null) {
      throw new Error("Password not set");
    }

    const password = await decrypt(script, value);
    if (password !== value) {
      throw new Error("Invalid password");
    }
    sendBackground.message("tryToUnlock", value);
  });
};

export const useAuthenticationMutation = (signal: AbortSignal) => {
  return useMutation<string, Error, void>(async () => {
    const data = await getAuthConfiguration();
    if (data.kind !== "webauthn") {
      throw new Error("Unexpected auth kind");
    }

    const options: CredentialRequestOptions = {
      publicKey: {
        challenge: crypto.randomBytes(32),
        allowCredentials: [
          {
            id: Buffer.from(data.credentialId, "hex"),
            type: "public-key",
            transports: data.transports,
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
      signal,
    };

    const assertion = (await navigator.credentials.get(
      options
    )) as PublicKeyCredential;

    if (signal.aborted) {
      throw new Error("Verification canceled");
    }

    const response = assertion.response as AuthenticatorAssertionResponse;

    const extensions = assertion.getClientExtensionResults();
    if (data.type == "userHandle") {
      if (!response.userHandle) {
        throw new Error("missing userHandle");
      }
      return Buffer.from(response.userHandle).toString("hex");
    } else {
      return Buffer.from(extensions.largeBlob?.blob ?? "").toString("hex");
    }
  });
};

export const useUnlockWebAuthnMutation = () => {
  return useMutation<void, Error, void>(async () => {
    await getWebAuthnPassword(async () => {
      sendBackground.message("tryToUnlock", "webauthn");
    });
  });
};
