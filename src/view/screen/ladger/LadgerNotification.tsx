import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { popUpInternalEventEmitter } from "../../../libs/popUpEvent";
import { LadgerTransfer } from "../../../libs/service/transfer/ladger";
import { delay } from "../../../libs/state/accountService";
import { ButtonLink, Gap, Text } from "../../components/Components";
import { WalletStateContext } from "../../context";
import { Block, Grid, Splash } from "../Overlay";
import {
  useConnectLadgerDevice,
  useGetLadgerTransport,
  useSignLadgerTransaction,
} from "./api";

const CancelButton = styled(ButtonLink)`
  padding-bottom: ${(props) => props.theme.padding};
`;

interface Message {
  id: number;
  params: LadgerTransfer;
}

export const LadgerNotification = () => {
  const wallet = useContext(WalletStateContext);

  const [message, setMessage] = useState<Message | undefined>(undefined);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState("");

  const {
    mutateAsync: connectAsync,
    isLoading: isConnecting,
    reset: resetConnect,
  } = useConnectLadgerDevice();

  const {
    mutateAsync: openTonAppAsync,
    isLoading: isOpeningTonApp,
    reset: resetTonApp,
  } = useGetLadgerTransport();

  const {
    mutateAsync: signAsync,
    isLoading: isSigning,
    reset: resetSign,
  } = useSignLadgerTransaction();
  useEffect(() => {
    if (message) {
      delay(20).then(() => setActive(true));
    }
  }, [message]);

  useEffect(() => {
    if (active) {
      resetConnect();
      resetTonApp();
      resetSign();

      delay(10)
        .then(() => connectAsync())
        .then(() => openTonAppAsync())
        .then((transport) => signAsync({ transport, params: message?.params! }))
        .then((cell) => {
          popUpInternalEventEmitter.emit("response", {
            method: "response",
            id: message?.id,
            params: { cell: cell.toBoc().toString("base64") },
          });
          setResult("Signed");
        })
        .catch((error) => {
          popUpInternalEventEmitter.emit("response", {
            method: "response",
            id: message?.id,
            params: {
              error: typeof error === "string" ? new Error(error) : error,
            },
          });
          setResult("Error");
        })
        .then(() => delay(400))
        .then(() => setActive(false))
        .then(() => delay(300))
        .then(() => {
          setMessage(undefined);
          setResult("");
        });
    }
  }, [active]);

  useEffect(() => {
    const handler = ({
      id,
      params,
    }: {
      id?: number | undefined;
      params: LadgerTransfer;
    }) => {
      setMessage((prev) => {
        if (prev != null || !wallet.isLadger) {
          popUpInternalEventEmitter.emit("response", {
            method: "response",
            id,
            params: { error: new Error("Wallet is not a ladger account") },
          });
          return prev;
        } else {
          return { id: id ?? 0, params };
        }
      });
    };
    popUpInternalEventEmitter.on("ladgerTransaction", handler);

    return () => {
      popUpInternalEventEmitter.off("ladgerTransaction", handler);
    };
  }, []);

  const onCancel = async () => {
    popUpInternalEventEmitter.emit("response", {
      method: "response",
      id: message?.id,
      params: { error: new Error("Canceled") },
    });
    setResult("Cancel");

    await delay(400);
    setActive(false);
    await delay(300);
    setMessage(undefined);
    setResult("");
  };

  return (
    <>
      {message && <Splash active={active} />}
      <Block active={active}>
        <Grid>
          <Gap />
          {isConnecting && (
            <Text>Step 1 of 3: Connect Ladger by USB and unlock</Text>
          )}
          {isOpeningTonApp && <Text>Step 2 of 3: Open TON Ladger App</Text>}
          {isSigning && <Text>Step 3 of 3: Sign Transaction</Text>}
          {result && <Text>{result}</Text>}
          <Gap />
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
        </Grid>
      </Block>
    </>
  );
};
