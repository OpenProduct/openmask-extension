import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { popUpInternalEventEmitter } from "../../../libs/popUpEvent";
import { delay } from "../../../libs/state/accountService";
import { ButtonLink, Gap, Text } from "../../components/Components";
import { Dots } from "../../components/Dots";
import { Fingerprint } from "../../components/Fingerprint";
import { Block, Grid, Splash } from "../Overlay";
import { useAuthenticationMutation } from "./api";

const CancelButton = styled(ButtonLink)`
  padding-bottom: ${(props) => props.theme.padding};
`;

export const WebAuthnNotification = () => {
  const [messageId, setMessageId] = useState<number | undefined>(undefined);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState("");

  const controller = useMemo(() => {
    return new AbortController();
  }, [messageId]);

  const { mutateAsync, error, reset } = useAuthenticationMutation(
    controller.signal
  );
  useEffect(() => {
    if (messageId) {
      delay(20).then(() => setActive(true));
    }
  }, [messageId]);

  useEffect(() => {
    if (error) {
      popUpInternalEventEmitter.emit("response", {
        method: "response",
        id: messageId,
        params: error,
      });
      setResult("Error");

      delay(300)
        .then(() => setActive(false))
        .then(() => delay(300))
        .then(() => {
          setMessageId(undefined);
          setResult("");
        });
    }
  }, [error]);

  useEffect(() => {
    if (active) {
      reset();
      delay(100)
        .then(() => mutateAsync())
        .then((password) => {
          popUpInternalEventEmitter.emit("response", {
            method: "response",
            id: messageId,
            params: password,
          });
          setResult("Verified");
        })
        .catch((error) => {
          popUpInternalEventEmitter.emit("response", {
            method: "response",
            id: messageId,
            params: typeof error === "string" ? new Error(error) : error,
          });
          setResult("Error");
        })
        .then(() => delay(300))
        .then(() => setActive(false))
        .then(() => delay(300))
        .then(() => {
          setMessageId(undefined);
          setResult("");
        });
    }
  }, [active]);

  useEffect(() => {
    const handler = ({ id }: { id?: number | undefined }) => {
      setMessageId((prevId) => {
        if (prevId != null) {
          popUpInternalEventEmitter.emit("response", {
            method: "response",
            id,
            params: new Error("Auntification already in progress"),
          });
          return prevId;
        } else {
          return id;
        }
      });
    };
    popUpInternalEventEmitter.on("getWebAuthn", handler);

    return () => {
      popUpInternalEventEmitter.off("getWebAuthn", handler);
    };
  }, []);

  return (
    <>
      {messageId && <Splash active={active} />}
      <Block active={active}>
        <Grid>
          <Gap />
          <Text>Verify your identity</Text>
          <Fingerprint size="small" />
          <Text>{result || <Dots>Scanning</Dots>}</Text>
          <Gap />
          <CancelButton
            onClick={() => controller.abort("Verification canceled")}
          >
            Cancel
          </CancelButton>
        </Grid>
      </Block>
    </>
  );
};
