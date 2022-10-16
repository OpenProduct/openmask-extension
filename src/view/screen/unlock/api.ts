import { startAuthentication } from "@simplewebauthn/browser";
import { PublicKeyCredentialRequestOptionsJSON } from "@simplewebauthn/typescript-types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import crypto from "crypto";
import { decrypt } from "../../../libs/service/cryptoService";
import { verifyAuthenticationResponse } from "../../../libs/service/webAuthn/getAuthenticationResponse";
import {
  getAuthConfiguration,
  getScript,
  QueryType,
  updateAuthCounter,
} from "../../../libs/store/browserStore";
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

export const useUnlockWebAuthnMutation = () => {
  const client = useQueryClient();
  return useMutation<void, Error, void>(async () => {
    const data = await getAuthConfiguration();
    if (data.kind !== "webauthn") {
      throw new Error("Unexpected auth kind");
    }
    const challenge = crypto.randomBytes(32).toString("hex");
    const options: PublicKeyCredentialRequestOptionsJSON = {
      challenge,
      allowCredentials: [
        {
          id: data.credentialsId,
          type: "public-key",
          transports: data.transports,
        },
      ],
      userVerification: "required",
    };
    const authentication = await startAuthentication(options);

    const { newCounter } = await verifyAuthenticationResponse(
      authentication,
      data
    );

    await updateAuthCounter(data, newCounter);
    sendBackground.message("tryToUnlock", "webauthn");
    client.invalidateQueries([QueryType.auth]);
  });
};
