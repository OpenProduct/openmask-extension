import { FC, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Badge, Container, Icon } from "../components/Components";
import { DropDown, DropDownList, ListItem } from "../components/DropDown";
import { CheckIcon, UserIcon } from "../components/Icons";
import {
  QueryType,
  useMutateNetworkStore,
  useMutateStore,
  useNetwork,
} from "../lib/state";
import {
  AccountState,
  useAccountState,
  useCreateWalletMutation,
} from "../lib/state/account";
import { networkConfigs } from "../lib/state/network";
import { useBalance, WalletState } from "../lib/state/wallet";
import { AppRoute } from "./routes";

const Head = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.lightGray};
`;

const Menu = styled.div`
  width: 300px;
`;

const Item = styled.div`
  padding: 10px 20px;
`;

const Divider = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.gray};
`;

const Balance = styled.span`
  margin-left: ${(props) => props.theme.padding};
  color: ${(props) => props.theme.darkGray};
`;

const AccountItem = styled(ListItem)`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Account: FC<{
  onClick: () => void;
  wallet: WalletState;
  active?: string;
}> = ({ onClick, wallet, active }) => {
  const { data } = useBalance(wallet.address);
  return (
    <AccountItem onClick={onClick}>
      {wallet.address === active && (
        <>
          <CheckIcon />{" "}
        </>
      )}
      {wallet.name}
      {data && <Balance>{data} TON</Balance>}
    </AccountItem>
  );
};

export const Header = () => {
  const navigate = useNavigate();
  const { data } = useNetwork();
  const { mutate } = useMutateStore<string>(QueryType.network);
  const { mutateAsync, reset } = useMutateNetworkStore<AccountState>(
    QueryType.account
  );

  const { data: account } = useAccountState();
  const onCreate = useCreateWalletMutation();

  const onSelect = useCallback(
    async (address: string) => {
      if (!account) return;
      await mutateAsync({
        ...account,
        activeWallet: address,
      });
      reset();
    },
    [account, reset, mutateAsync]
  );

  return (
    <Head>
      <img src="tonmask-logo.svg" width="38" height="38" alt="TonMask Logo" />
      <DropDownList
        options={networkConfigs}
        renderOption={(c) => c.name}
        onSelect={(c) => mutate(c.name)}
      >
        <Badge>{data}</Badge>
      </DropDownList>
      {account && (
        <DropDown
          payload={(onClose) => (
            <Menu>
              <Item>Accounts</Item>
              <Divider />
              {account.wallets.map((wallet) => (
                <Account
                  key={wallet.address}
                  wallet={wallet}
                  active={account.activeWallet}
                  onClick={() => {
                    onSelect(wallet.address);
                    onClose();
                  }}
                />
              ))}
              {account.wallets.length !== 0 && <Divider />}
              <ListItem
                onClick={() => {
                  onCreate();
                  onClose();
                }}
              >
                Create Wallet
              </ListItem>
              <ListItem
                onClick={() => {
                  onClose();
                  navigate(AppRoute.import);
                }}
              >
                Import Wallet
              </ListItem>
              <Divider />
              <ListItem
                onClick={() => {
                  onClose();
                  navigate(AppRoute.setting);
                }}
              >
                Account Settings
              </ListItem>
            </Menu>
          )}
        >
          <Icon>
            <UserIcon />
          </Icon>
        </DropDown>
      )}
    </Head>
  );
};
