import { ALL } from "@openproduct/web-sdk";
import { useContext, useState } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { WalletState, WalletVersion } from "../../../../../libs/entries/wallet";
import { decryptMnemonic } from "../../../../../libs/state/accountService";
import { getWebAuthnPassword } from "../../../../api";
import {
  Body,
  ButtonDanger,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  ErrorMessage,
  ErrorText,
  Gap,
  H1,
  Input,
  SelectLabel,
  SelectPayload,
  Textarea,
} from "../../../../components/Components";
import { DropDownList } from "../../../../components/DropDown";
import { HomeButton } from "../../../../components/HomeButton";
import {
  ArrowDownIcon,
  DeleteIcon,
  FingerprintIcon,
} from "../../../../components/Icons";
import { WalletStateContext } from "../../../../context";
import { AppRoute, relative } from "../../../../routes";
import { useAuthConfiguration } from "../../../settings/api";
import { useDeleteWalletMutation, useUpdateWalletMutation } from "./api";
import { LedgerSettings } from "./LedgerSettings";
import { WalletRoutes } from "./route";

const Text = styled.div`
  font-size: medium;
  margin-top: ${(props) => props.theme.padding};
`;

const bounceableOptions = ["Bounceable", "Non Bounceable"];

const SettingsIndex = () => {
  const navigate = useNavigate();
  const wallet = useContext(WalletStateContext);

  const [name, setName] = useState(wallet.name);

  const { mutateAsync, reset } = useUpdateWalletMutation();
  const onChange = async (fields: Partial<WalletState>) => {
    reset();
    await mutateAsync(fields);
  };

  return (
    <>
      <HomeButton />
      <Body>
        <H1>Wallet Settings</H1>

        <SelectLabel>Wallet Name</SelectLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            onChange({ name });
          }}
        />

        <SelectLabel>Address</SelectLabel>
        <DropDownList
          isLeft
          options={bounceableOptions}
          renderOption={(value) => value}
          onSelect={(value) =>
            onChange({ isBounceable: value === bounceableOptions[0] })
          }
        >
          <SelectPayload>
            {wallet.isBounceable ? bounceableOptions[0] : bounceableOptions[1]}
            <ArrowDownIcon />
          </SelectPayload>
        </DropDownList>

        <SelectLabel>Version</SelectLabel>
        <DropDownList
          isLeft
          options={Object.keys(ALL)}
          renderOption={(value) => value}
          onSelect={(version) =>
            onChange({ version: version as WalletVersion })
          }
        >
          <SelectPayload>
            {wallet.version} <ArrowDownIcon />
          </SelectPayload>
        </DropDownList>

        <SelectLabel>Reveal Secret Recovery Phrase</SelectLabel>
        <ButtonDanger onClick={() => navigate(relative(WalletRoutes.mnemonic))}>
          Reveal Secret Recovery Phrase
        </ButtonDanger>

        <SelectLabel>Delete Wallet</SelectLabel>
        <ButtonDanger onClick={() => navigate(relative(WalletRoutes.delete))}>
          Delete Wallet <DeleteIcon />
        </ButtonDanger>
      </Body>
    </>
  );
};

const SettingsMnemonic = () => {
  const navigate = useNavigate();

  const wallet = useContext(WalletStateContext);

  const [value, setValue] = useState("");
  const [mnemonic, setMnemonic] = useState("");
  const [error, setError] = useState(false);

  const { data } = useAuthConfiguration();
  const isWebAuth = data?.kind == "webauthn";

  const isShow = mnemonic !== "";

  const onNext = async () => {
    if (isShow) return;

    try {
      if (isWebAuth) {
        getWebAuthnPassword(async (password) => {
          setMnemonic(await decryptMnemonic(wallet.mnemonic, password));
        });
      } else {
        setMnemonic(await decryptMnemonic(wallet.mnemonic, value));
      }
    } catch (e) {
      setError(true);
    }
  };

  return (
    <Body>
      <H1>Secret Recovery Phrase</H1>
      <Text>
        If you ever change browsers or move computers, you will need this Secret
        Recovery Phrase to access your wallet. Save them somewhere safe and
        secret.
      </Text>
      <ErrorMessage>
        DO NOT share this phrase with anyone! These words can be used to steal
        your wallet.
      </ErrorMessage>
      {isShow ? (
        <Textarea disabled rows={9} value={mnemonic} />
      ) : !isWebAuth ? (
        <div>
          <label>Enter password to continue</label>
          <Input
            type="password"
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
          {error && <ErrorText>Invalid Password</ErrorText>}
        </div>
      ) : undefined}

      <Gap />
      <ButtonRow>
        <ButtonNegative onClick={() => navigate(AppRoute.wallet)}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onNext} disabled={isShow}>
          Show {isWebAuth && <FingerprintIcon />}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};

const SettingsDelete = () => {
  const navigate = useNavigate();
  const { mutateAsync, isLoading } = useDeleteWalletMutation();

  const onDelete = async () => {
    await mutateAsync();
    navigate(AppRoute.home);
  };

  return (
    <Body>
      <H1>Delete Wallet</H1>
      <Text>Deleting your wallet will clear all local stored data.</Text>
      <Text>The wallet could be re-enter by Secret Recovery Phrase.</Text>
      <Text>
        OpenMask team cannot recover your wallet Secret Recovery Phrase.
      </Text>
      <Gap />
      <ButtonRow>
        <ButtonNegative
          onClick={() => navigate(AppRoute.wallet)}
          disabled={isLoading}
        >
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onDelete} disabled={isLoading}>
          Delete
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};

export const WalletSettings = () => {
  const wallet = useContext(WalletStateContext);

  return (
    <Routes>
      <Route path={WalletRoutes.mnemonic} element={<SettingsMnemonic />} />
      <Route path={WalletRoutes.delete} element={<SettingsDelete />} />
      <Route
        path={WalletRoutes.index}
        element={wallet.ledger ? <LedgerSettings /> : <SettingsIndex />}
      />
    </Routes>
  );
};
