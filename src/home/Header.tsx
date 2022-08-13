import { useCallback } from "react";
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

export const Header = () => {
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
                <ListItem
                  onClick={() => {
                    onSelect(wallet.address);
                    onClose();
                  }}
                >
                  {wallet.name}{" "}
                  {wallet.address === account.activeWallet && <CheckIcon />}
                </ListItem>
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
              <ListItem>Import Wallet</ListItem>
              <Divider />
              <ListItem>Settings</ListItem>
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
