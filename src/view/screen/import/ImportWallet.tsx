import { useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Body,
  ButtonBottomRow,
  ButtonNegative,
  ButtonPositive,
  ErrorMessage,
  H1,
  Text,
} from "../../components/Components";
import { CheckIcon, CloseIcon } from "../../components/Icons";
import { AppRoute, relative } from "../../routes";
import { useImportWalletMutation } from "./api";

enum ImportRoutes {
  index = "/",
  mnemonic = "/mnemonic",
}

const MnemonicBlock = styled.div`
  background-color: light-dark(rgba(239, 239, 239, 0.3), rgba(59, 59, 59, 0.3));
  color: light-dark(rgb(84, 84, 84), rgb(170, 170, 170));
  border-color: rgba(118, 118, 118, 0.3);
  padding: 10px;
  margin-bottom: 15px;
  height: 100px;
  border: 1px solid;

  &:focus,
  &:active {
    border-color: blue;
  }
`;

const ImportMnemonic = () => {
  const navigate = useNavigate();

  const { mutateAsync, isLoading, reset, error } = useImportWalletMutation();
  const [value, setValue] = useState("");

  const onConnect = async () => {
    reset();
    await mutateAsync(value);
    navigate(AppRoute.home);
  };

  return (
    <Body>
      <H1>Import existing wallet</H1>
      <Text>To connect wallet, please enter your mnemonic here</Text>
      <Text>24 words separated by a space: thought borrow spend aisle....</Text>
      <MnemonicBlock
        contentEditable
        onBlur={(t) => !isLoading && setValue(t.currentTarget.innerText)}
      >
        {value}
      </MnemonicBlock>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      <ButtonBottomRow>
        <ButtonNegative
          disabled={isLoading}
          onClick={() => navigate(AppRoute.home)}
        >
          Cancel
        </ButtonNegative>
        <ButtonPositive disabled={isLoading} onClick={onConnect}>
          Connect
        </ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};

const ImportIndex = () => {
  const navigate = useNavigate();
  return (
    <Body>
      <H1>Get Started with OpenMask</H1>
      <Text>
        OpenMask is open source software, you may alway check code on a GitHub.
        Wallet is not profitable, don't charge any commission for transactions
        and store all user data on a user device.
      </Text>
      <Text>
        <CheckIcon /> OpenMask <b>Always</b> connecting you to The Open Network
        and the decentralized web
      </Text>
      <Text>
        <CloseIcon /> OpenMask <b>Never</b> collect keys, addresses,
        transactions, balances, hashes, or any personal information
      </Text>
      <ButtonBottomRow>
        <ButtonNegative onClick={() => navigate(AppRoute.home)}>
          No Thanks
        </ButtonNegative>
        <ButtonPositive
          onClick={() => navigate(relative(ImportRoutes.mnemonic))}
        >
          Input Mnemonic
        </ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};

export const Import = () => {
  return (
    <Routes>
      <Route path={ImportRoutes.mnemonic} element={<ImportMnemonic />} />
      <Route path={ImportRoutes.index} element={<ImportIndex />} />
    </Routes>
  );
};
