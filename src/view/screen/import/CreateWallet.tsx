import React, { FC, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as tonMnemonic from "tonweb-mnemonic";
import {
  Body,
  ButtonColumn,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Container,
  ErrorMessage,
  H1,
  Input,
  Text,
  Textarea,
} from "../../components/Components";
import { BackIcon } from "../../components/Icons";
import { AppRoute } from "../../routes";
import { useCreateWalletMutation } from "./api";

export const Create = () => {
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState("");
  const [test, setTest] = useState(false);
  const [show, setShow] = useState(false);

  const { mutateAsync, reset, isLoading } = useCreateWalletMutation();

  useEffect(() => {
    tonMnemonic
      .generateMnemonic()
      .then((words) => setMnemonic(words.join(" ")));
  }, []);

  const disabled = mnemonic === "" || isLoading;

  const onShow = () => {
    if (!show) {
      setShow(true);
      return;
    }
    setTest(true);
  };

  const onCreate = async () => {
    setTest(false);
    reset();
    await mutateAsync(mnemonic);
    navigate(AppRoute.home);
  };

  if (test) {
    return (
      <RememberMnemonic
        mnemonic={mnemonic}
        onConfirm={onCreate}
        onBack={() => setTest(false)}
      />
    );
  }

  return (
    <Body>
      <H1>Secret Recovery Phrase</H1>
      <Text>
        Your Secret Recovery Phrase makes it easy to back up and restore your
        account.
      </Text>
      <ErrorMessage>
        WARNING: Never disclose your Secret Recovery Phrase. Anyone with this
        phrase can take your crypto forever.
      </ErrorMessage>
      <Textarea disabled rows={8} value={show ? mnemonic : ""} />
      <Text>OpenMask cannot recover your Secret Recovery Phrase.</Text>
      <ButtonRow>
        <ButtonNegative
          disabled={isLoading}
          onClick={() => navigate(AppRoute.home)}
        >
          Cancel
        </ButtonNegative>
        <ButtonPositive disabled={disabled} onClick={onShow}>
          {show ? "Create" : "Show"}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};

const Block = styled(Container)`
  width: 100%;
`;
const Button = styled.div`
  cursor: pointer;
`;

const Label = styled.div`
  font-size: medium;
`;

type RememberProps = {
  mnemonic: string;
  onConfirm: () => void;
  onBack: () => void;
};

function getRandomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

export const RememberMnemonic: FC<RememberProps> = React.memo(
  ({ mnemonic, onConfirm, onBack }) => {
    const items = mnemonic.split(" ");

    const [one, setOne] = useState("");
    const [two, setTwo] = useState("");
    const [three, setThree] = useState("");

    const [test1, test2, test3] = useMemo(() => {
      return [getRandomInt(1, 8), getRandomInt(8, 16), getRandomInt(16, 24)];
    }, []);

    const isValid =
      one.toLowerCase().trim() === items[test1 - 1] &&
      two.toLowerCase().trim() === items[test2 - 1] &&
      three.toLowerCase().trim() === items[test3 - 1];

    return (
      <>
        <Block>
          <Button onClick={onBack}>
            <BackIcon /> Back
          </Button>
        </Block>
        <Body>
          <H1>Secret Recovery Phrase</H1>
          <Text>
            Now let's check that you wrote your secret words correctly
          </Text>
          <Text>Please enter the words:</Text>
          <ButtonColumn>
            <label>
              <Label>Word {test1}</Label>
              <Input value={one} onChange={(e) => setOne(e.target.value)} />
            </label>
            <label>
              <Label>Word {test2}</Label>
              <Input value={two} onChange={(e) => setTwo(e.target.value)} />
            </label>
            <label>
              <Label>Word {test3}</Label>
              <Input value={three} onChange={(e) => setThree(e.target.value)} />
            </label>
            <ButtonPositive disabled={!isValid} onClick={onConfirm}>
              Confirm
            </ButtonPositive>
          </ButtonColumn>
        </Body>
      </>
    );
  }
);
