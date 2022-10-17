import { useEffect, useState } from "react";
import styled, { css } from "styled-components";
import { popUpInternalEventEmitter } from "../../../libs/popUpEvent";
import { delay } from "../../../libs/state/accountService";
import { Text } from "../../components/Components";
import { Dots } from "../../components/Dots";
import { Fingerprint } from "../../components/Fingerprint";
import { useAuthenticationMutation } from "./api";

const Splash = styled.div<{ active: boolean }>`
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  background: ${(props) => props.theme.background};
  transition: opacity 0.4s ease-in-out;

  ${(props) =>
    props.active &&
    css`
      opacity: 0.5;
    `}
`;

const Block = styled.div<{ active: boolean }>`
  z-index: 20;
  position: fixed;
  left: 0;
  right: 0;
  height: 280px;
  bottom: -280px;
  transition: bottom 0.4s ease-in-out;
  background: ${(props) => props.theme.background};
  border-top: 1px solid ${(props) => props.theme.darkGray};

  ${(props) =>
    props.active &&
    css`
      bottom: 0;
    `}
`;

const Grid = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${(props) => props.theme.padding};
`;

export const WebAuthnNotification = () => {
  const [messageId, setMessageId] = useState<number | undefined>(undefined);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState("");

  const { mutateAsync, error, reset } = useAuthenticationMutation();
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

      delay(400)
        .then(() => setActive(false))
        .then(() => delay(400))
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
            params: error,
          });
          setResult("Error");
        })
        .then(() => delay(400))
        .then(() => setActive(false))
        .then(() => delay(400))
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
          <Text>Verify your identity</Text>
          <Fingerprint size="small" />
          <Text>{result || <Dots>Scanning</Dots>}</Text>
        </Grid>
      </Block>
    </>
  );
};
