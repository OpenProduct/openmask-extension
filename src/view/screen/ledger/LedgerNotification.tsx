import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { WalletState } from "../../../libs/entries/wallet";
import { popUpInternalEventEmitter } from "../../../libs/popUpEvent";
import { LedgerTransfer } from "../../../libs/service/transfer/ledger";
import { delay } from "../../../libs/state/accountService";
import { ButtonLink, Gap, Text } from "../../components/Components";
import { Dots } from "../../components/Dots";
import { WalletStateContext } from "../../context";
import { Block, Grid, Splash } from "../Overlay";
import { useConnectLedgerTransport, useSignLedgerTransaction } from "./api";

const CancelButton = styled(ButtonLink)`
  padding-bottom: ${(props) => props.theme.padding};
`;

interface Message {
  id: number;
  params: LedgerTransfer;
}

export const LedgerNotification = () => {
  const wallet: WalletState | undefined = useContext(WalletStateContext);

  const [message, setMessage] = useState<Message | undefined>(undefined);
  const [active, setActive] = useState(false);
  const [result, setResult] = useState("");

  const {
    mutateAsync: connectAsync,
    isLoading: isConnecting,
    reset: resetConnect,
  } = useConnectLedgerTransport(wallet?.ledger?.driver);

  const {
    mutateAsync: signAsync,
    isLoading: isSigning,
    reset: resetSign,
  } = useSignLedgerTransaction();

  useEffect(() => {
    if (message) {
      delay(20).then(() => setActive(true));
    }
  }, [message]);

  useEffect(() => {
    if (active) {
      resetConnect();
      resetSign();

      delay(10)
        .then(() => connectAsync())
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
      params: LedgerTransfer;
    }) => {
      setMessage((prev) => {
        if (prev != null || !wallet.ledger) {
          popUpInternalEventEmitter.emit("response", {
            method: "response",
            id,
            params: { error: new Error("Wallet is not a Ledger account") },
          });
          return prev;
        } else {
          return { id: id ?? 0, params };
        }
      });
    };
    popUpInternalEventEmitter.on("LedgerTransaction", handler);

    return () => {
      popUpInternalEventEmitter.off("LedgerTransaction", handler);
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
          <Text>
            <b>Ledger Hardware Wallet</b>
          </Text>
          <img src="/ledger.png" width="180" />
          {isConnecting && !result && (
            <Text>
              <Dots>Unlock Ledger and Open TON App</Dots>
            </Text>
          )}
          {isSigning && !result && (
            <Text>
              <Dots>Sign Transaction</Dots>
            </Text>
          )}
          {result && <Text>{result}</Text>}
          <CancelButton onClick={onCancel}>Cancel</CancelButton>
        </Grid>
      </Block>
    </>
  );
};
