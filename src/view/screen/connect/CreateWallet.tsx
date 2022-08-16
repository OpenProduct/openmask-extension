import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import * as tonMnemonic from "tonweb-mnemonic";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  ErrorMessage,
  Gap,
  H1,
} from "../../components/Components";
import { useCreateWalletMutation } from "../../lib/state/account";
import { AppRoute } from "../../routes";

const Text = styled.div`
  padding-bottom: ${(props) => props.theme.padding};
  font-size: medium;
`;

const Textarea = styled.textarea`
  resize: vertical;
  padding: 10px;
  margin-bottom: ${(props) => props.theme.padding};
`;

export const Create = () => {
  const navigate = useNavigate();
  const [mnemonic, setMnemonic] = useState("");
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
    onCreate();
  };

  const onCreate = async () => {
    reset();
    await mutateAsync(mnemonic);
    navigate(AppRoute.home);
  };

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
      <Text>TonMask cannot recover your Secret Recovery Phrase.</Text>

      <Gap />
      <ButtonRow>
        <ButtonNegative disabled={disabled} onClick={onCreate}>
          Skip
        </ButtonNegative>
        <ButtonPositive disabled={disabled} onClick={onShow}>
          {show ? "Create" : "Show"}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};

// https://metamask.zendesk.com/hc/en-us/articles/360015489591-Basic-Safety-Tips
// Never share your Secret Recovery Phrase with anyone The MetaMask team will
// never ask for your Secret Recovery Phrase Always keep your Secret Recovery
// Phrase in a secure and secret place
