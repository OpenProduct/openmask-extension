import { useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { WalletState } from "../../../../libs/entries/wallet";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Center,
  ErrorMessage,
  H1,
  Text,
} from "../../../components/Components";
import { AppRoute } from "../../../routes";
import { Wallet } from "../../notifications/connect/ConnectDApp";
import {
  useAddWalletMutation,
  useConnectLadgerDevice,
  useGetLadgerTransport,
  useLadgerAccounts,
} from "./api";

const Block = styled.div`
  margin-bottom: ${(props) => props.theme.padding};
`;

const Step = styled.div`
  min-height: 200px;
`;

export const LadgerWallet = () => {
  const navigate = useNavigate();
  const [accounts, setAccounts] = useState<WalletState[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const {
    mutateAsync: connectAsync,
    isLoading: isConnecting,
    error: connectError,
    reset: resetConnect,
  } = useConnectLadgerDevice();
  const {
    mutateAsync: openTonAppAsync,
    isLoading: isOpeningTonApp,
    error: tonAppError,
    reset: resetTonApp,
  } = useGetLadgerTransport();

  const {
    mutateAsync: accountsAsync,
    isLoading: isAccountLoading,
    error: accountError,
    reset: resetAccounts,
  } = useLadgerAccounts();

  const { mutateAsync: addAccounts } = useAddWalletMutation();
  const isLoading = isConnecting || isOpeningTonApp || isAccountLoading;

  const onConnect = async () => {
    if (accounts) resetConnect();
    resetTonApp();
    resetAccounts();
    await connectAsync();
    const transport = await openTonAppAsync();
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
        <H1>Connect Ladger</H1>
      </Center>

      {isConnecting && (
        <Step>
          <Text>Step 1 of 3: Connect Ladger by USB and unlock</Text>
        </Step>
      )}
      {isOpeningTonApp && (
        <Step>
          <Text>Step 2 of 3: Open TON Ladger App</Text>
        </Step>
      )}
      {isAccountLoading && (
        <Step>
          <Text>Step 3 of 3: Get Account data</Text>
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
      {tonAppError && <ErrorMessage>{tonAppError.message}</ErrorMessage>}
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
