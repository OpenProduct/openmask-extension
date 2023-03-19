import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { LedgerDriver, WalletState } from "../../../libs/entries/wallet";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Center,
  ErrorMessage,
  H1,
  SelectPayload,
  Text,
} from "../../components/Components";
import { Dots } from "../../components/Dots";
import { DropDownList } from "../../components/DropDown";
import { ArrowDownIcon } from "../../components/Icons";
import { AppRoute } from "../../routes";

import { Wallet } from "../notifications/connect/ConnectDApp";
import {
  useAddWalletMutation,
  useConnectLedgerTransport,
  useLedgerAccounts,
  useUnPairLedgerDevice,
} from "./api";

const Block = styled.div`
  margin-bottom: ${(props) => props.theme.padding};
`;

const Step = styled.div`
  width: 100%;
  text-align: center;
  padding: ${(props) => props.theme.padding} 0;
`;

const drivers: LedgerDriver[] = ["USB", "HID"];

export const LedgerWallet = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<WalletState[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [driver, setDriver] = useState<LedgerDriver>("USB");

  const { mutateAsync, reset } = useUnPairLedgerDevice(driver);

  const onChangeDriver = async (value: LedgerDriver) => {
    reset();
    await mutateAsync();
    setDriver(value);
    setAccounts([]);
    setSelected([]);
  };

  const {
    mutateAsync: connectAsync,
    isLoading: isConnecting,
    error: connectError,
    reset: resetConnect,
  } = useConnectLedgerTransport(driver);

  const {
    mutateAsync: accountsAsync,
    isLoading: isAccountLoading,
    error: accountError,
    reset: resetAccounts,
  } = useLedgerAccounts(driver);

  const { mutateAsync: addAccounts } = useAddWalletMutation();
  const isLoading = isConnecting || isAccountLoading;

  const onConnect = async () => {
    if (accounts) resetConnect();
    resetAccounts();
    const transport = await connectAsync();
    const wallets = await accountsAsync(transport);
    setAccounts(wallets);
    setSelected([wallets[0].address]);
  };

  const onAdd = async () => {
    const filtered = selected.map(
      (address) =>
        accounts.find((item) => item.address === address) as WalletState
    );
    if (filtered.length === 0) return;
    await addAccounts(filtered);
    navigate(AppRoute.home);
  };

  return (
    <Body>
      <Center>
        <H1>Connect Ledger</H1>
      </Center>

      <div>
        <b>Driver</b>
      </div>
      <DropDownList
        isLeft
        options={drivers}
        renderOption={(value) => value}
        onSelect={onChangeDriver}
      >
        <SelectPayload>
          {driver}
          <ArrowDownIcon />
        </SelectPayload>
      </DropDownList>

      {accounts.length === 0 && (
        <Step>
          <img src="/ledger.png" width="300" />
        </Step>
      )}

      {isConnecting && (
        <Step>
          <Text>
            <Dots>Unlock Ledger and Open TON App</Dots>
          </Text>
        </Step>
      )}
      {isAccountLoading && (
        <Step>
          <Text>
            <Dots>Loading Account data</Dots>
          </Text>
        </Step>
      )}

      <Block>
        {accounts.map((wallet) => {
          return (
            <Wallet
              key={wallet.address}
              wallet={wallet}
              selected={selected.includes(wallet.address)}
              onSelect={(value) => {
                if (value) {
                  setSelected((items) => items.concat([wallet.address]));
                } else {
                  setSelected((items) =>
                    items.filter((item) => item !== wallet.address)
                  );
                }
              }}
            />
          );
        })}
      </Block>

      {connectError && <ErrorMessage>{connectError.message}</ErrorMessage>}
      {accountError && <ErrorMessage>{accountError.message}</ErrorMessage>}

      <ButtonRow>
        <ButtonNegative onClick={() => navigate(AppRoute.home)}>
          Cancel
        </ButtonNegative>
        <ButtonPositive
          disabled={isLoading}
          onClick={accounts.length === 0 ? onConnect : onAdd}
        >
          {accounts.length === 0 ? "Connect" : "Add"}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
