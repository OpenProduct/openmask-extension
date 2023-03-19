import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { popUpInternalEventEmitter } from "../../../libs/popUpEvent";
import { delay } from "../../../libs/state/accountService";
import {
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Gap,
} from "../../components/Components";
import { InputField } from "../../components/InputField";
import { LoadingLogo } from "../../components/Logo";
import { Block, Grid, Splash } from "../Overlay";
import { useUnlockMutation } from "./api";

const Text = styled.div`
  font-size: medium;
`;

const Wrapper = styled(Grid)`
  padding: ${(props) => props.theme.padding};
  box-sizing: border-box;
`;

const LogoBlock = styled.div`
  transform: scale(0.5);
  height: 46px;
  position: relative;
  top: -25px;
`;
const InputBlock = styled.div`
  width: 100%;
`;

export const PasswordNotification = () => {
  const [messageId, setMessageId] = useState<number | undefined>(undefined);
  const [active, setActive] = useState(false);
  const [password, setPassword] = useState("");

  const { mutateAsync, isLoading, error, reset } = useUnlockMutation();

  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (messageId) {
      delay(20)
        .then(() => setActive(true))
        .then(() => ref.current && ref.current.focus());
    }
  }, [messageId]);

  useEffect(() => {
    reset();
  }, [password]);

  const closeModal = async () => {
    await delay(300);
    setActive(false);
    await delay(300);
    setMessageId(undefined);
  };

  const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.stopPropagation();
    e.preventDefault();

    if (!active) return;
    await mutateAsync(password);

    popUpInternalEventEmitter.emit("response", {
      method: "response",
      id: messageId,
      params: password,
    });

    await closeModal();
  };

  const onCancel = async () => {
    popUpInternalEventEmitter.emit("response", {
      method: "response",
      id: messageId,
      params: new Error("Cancel"),
    });
    await closeModal();
  };

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
    popUpInternalEventEmitter.on("getPassword", handler);

    return () => {
      popUpInternalEventEmitter.off("getPassword", handler);
    };
  }, []);

  return (
    <>
      {messageId && <Splash active={active} />}
      <Block active={active} onSubmit={onSubmit}>
        <Wrapper>
          <Gap />
          <LogoBlock>
            <LoadingLogo></LoadingLogo>
          </LogoBlock>
          <Text>Verify your identity</Text>
          <InputBlock>
            <InputField
              ref={ref}
              label="Password"
              error={error}
              type="password"
              value={password}
              disabled={isLoading}
              onChange={(e) => setPassword(e.target.value)}
            />
          </InputBlock>

          <ButtonRow>
            <ButtonNegative
              type="button"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </ButtonNegative>
            <ButtonPositive type="submit" disabled={isLoading}>
              Unlock
            </ButtonPositive>
          </ButtonRow>
        </Wrapper>
      </Block>
    </>
  );
};
