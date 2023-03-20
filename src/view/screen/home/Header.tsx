import { FC, useCallback, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { NetworkConfig } from "../../../libs/entries/network";
import { WalletState } from "../../../libs/entries/wallet";
import ExtensionPlatform from "../../../libs/service/extension";
import { QueryType } from "../../../libs/store/browserStore";
import { useMutateStore } from "../../api";
import { Badge, Container, Icon } from "../../components/Components";
import { DropDown, DropDownList, ListItem } from "../../components/DropDown";
import {
  AddIcon,
  ArrowDownIcon,
  CheckIcon,
  ImportIcon,
  UsbIconSmall,
  UserIcon,
} from "../../components/Icons";
import {
  AccountStateContext,
  NetworkContext,
  NetworksContext,
} from "../../context";
import { sendBackground } from "../../event";
import { AppRoute } from "../../routes";
import { formatTonValue } from "../../utils";
import { ConnectRoutes } from "../import/ConnectWallet";
import { useLockScreen } from "../settings/api";
import { useBalance, useSelectWalletMutation } from "./api";

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
  display: flex;
  justify-content: space-between;
  align-items: center;
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

const BadgeLabel = styled.span`
  margin-left: ${(props) => props.theme.padding};
  border: 1px solid ${(props) => props.theme.darkGray};
  background: ${(props) => props.theme.lightGray};
  padding: 3px 8px;
  border-radius: 20px;
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
      {wallet.ledger && <BadgeLabel>Ledger</BadgeLabel>}
      {data && <Balance>{formatTonValue(data)} TON</Balance>}
    </AccountItem>
  );
};

export const Header: FC<{ lock: boolean }> = ({ lock }) => {
  const navigate = useNavigate();
  const account = useContext(AccountStateContext);
  const network = useContext(NetworkContext);
  const networks = useContext(NetworksContext);

  const { mutateAsync: mutateNetwork } = useMutateStore<string>(
    QueryType.network
  );

  const { mutateAsync: mutateSelect, reset: resetSelect } =
    useSelectWalletMutation();
  const { data: isLockScreen } = useLockScreen();

  const onLock = useCallback(async () => {
    sendBackground.message("lock");
  }, []);

  const onChain = useCallback(
    async (config: NetworkConfig) => {
      await mutateNetwork(config.name);
      navigate(AppRoute.home);
      sendBackground.message("chainChanged", config.name);
    },
    [mutateNetwork]
  );

  const onSelect = useCallback(
    async (address: string) => {
      resetSelect();
      navigate(AppRoute.home);
      await mutateSelect(address);
    },
    [resetSelect, mutateSelect]
  );

  if (lock) {
    return (
      <Head>
        <img
          src="tonmask-logo.svg"
          width="38"
          height="38"
          alt="OpenMask Logo"
        />
        <Badge>{network}</Badge>
      </Head>
    );
  }

  return (
    <Head>
      <img src="tonmask-logo.svg" width="38" height="38" alt="OpenMask Logo" />
      <DropDownList
        options={networks}
        renderOption={(c) => c.name}
        onSelect={onChain}
      >
        <Badge>
          {network} <ArrowDownIcon />
        </Badge>
      </DropDownList>
      {account && (
        <DropDown
          payload={(onClose) => (
            <Menu>
              <Item>
                <span>Accounts</span>
                {isLockScreen && <Badge onClick={onLock}>Lock</Badge>}
              </Item>
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
                  onClose();
                  ExtensionPlatform.openExtensionInBrowser(
                    AppRoute.import + ConnectRoutes.create
                  );
                }}
              >
                <AddIcon /> Create Wallet
              </ListItem>
              <ListItem
                onClick={() => {
                  onClose();
                  ExtensionPlatform.openExtensionInBrowser(
                    AppRoute.import + ConnectRoutes.import
                  );
                }}
              >
                <ImportIcon /> Import Wallet
              </ListItem>
              <ListItem
                onClick={() => {
                  onClose();
                  ExtensionPlatform.openExtensionInBrowser(
                    AppRoute.import + ConnectRoutes.hardware
                  );
                }}
              >
                <UsbIconSmall /> Connect Hardware Wallet
              </ListItem>
              <Divider />
              <ListItem
                onClick={() => {
                  onClose();
                  navigate(AppRoute.settings);
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
