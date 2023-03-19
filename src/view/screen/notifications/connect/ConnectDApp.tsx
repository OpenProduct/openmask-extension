import { FC, useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { ConnectDAppParams } from "../../../../libs/entries/notificationMessage";
import {
  Permission,
  PermissionList,
} from "../../../../libs/entries/permission";
import { WalletState } from "../../../../libs/entries/wallet";
import { NotificationFields } from "../../../../libs/event";
import ExtensionPlatform from "../../../../libs/service/extension";
import {
  Body,
  ButtonBottomRow,
  ButtonNegative,
  ButtonPositive,
  Center,
  Gap,
  H1,
  InlineLink,
  Scroll,
  Text,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { LinkIcon } from "../../../components/Icons";
import { AccountStateContext } from "../../../context";
import { sendBackground } from "../../../event";
import { formatTonValue, toShortAddress } from "../../../utils";
import { useBalance } from "../../home/api";
import { useAddConnectionMutation } from "./api";

const Label = styled.label`
  display: flex;
  gap: ${(props) => props.theme.padding};
  margin: 5px ${(props) => props.theme.padding};
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
`;

const Column = styled.div`
  overflow: hidden;
  flex-grow: 1;
  padding: 5px;
`;

const Row = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Balance = styled(Row)`
  color: ${(props) => props.theme.darkGray};
`;

export const Wallet: FC<{
  wallet: WalletState;
  selected: boolean;
  onSelect: (value: boolean) => void;
}> = ({ wallet, selected, onSelect }) => {
  const { data } = useBalance(wallet.address);

  return (
    <Label key={wallet.address}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(!selected)}
      />
      <Column>
        <Row>
          <b>{wallet.name}</b>
        </Row>
        <Row>{wallet.address}</Row>
        <Balance>{data ? formatTonValue(data) : "-"} TON</Balance>
      </Column>
    </Label>
  );
};

export const ConnectDApp: FC<
  NotificationFields<"connectDApp", ConnectDAppParams> & { onClose: () => void }
> = ({ id, logo, origin, onClose }) => {
  const [permission, setPermission] = useState(false);

  useEffect(() => {
    if (!origin) {
      sendBackground.message("rejectRequest", id);
      onClose();
    }
  }, []);

  const account = useContext(AccountStateContext);

  const [selected, setSelected] = useState([account.wallets[0].address]);

  const onCancel = () => {
    sendBackground.message("rejectRequest", id);
    onClose();
  };

  const onNext = () => {
    setPermission(true);
  };

  if (permission) {
    return (
      <ConfirmPermission
        origin={origin}
        addresses={selected}
        logo={logo}
        id={id}
        onBack={() => setPermission(false)}
        onOk={onClose}
      />
    );
  }

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Connect With OpenMask</H1>
        <Text>Select the account(s) to use on this site</Text>
      </Center>
      <Scroll>
        {account.wallets.map((wallet) => {
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
      </Scroll>
      <Gap />
      <ButtonBottomRow>
        <ButtonNegative onClick={onCancel}>Cancel</ButtonNegative>
        <ButtonPositive onClick={onNext}>Next</ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};

const PermissionDescription: FC<{ permission: Permission }> = ({
  permission,
}) => {
  switch (permission) {
    case Permission.base:
      return (
        <>
          Allow to read address, account balance, activity from unlocked wallet.
          Every time to connect OpenMask to dApp you have to put wallet
          password.
        </>
      );
    case Permission.locked:
      return (
        <>
          Allow to read address, account balance, activity from locked wallet.{" "}
          <InlineLink
            onClick={() =>
              ExtensionPlatform.openTab({
                url: "https://openmask.app/docs/permissions",
              })
            }
          >
            Read more <LinkIcon />
          </InlineLink>
        </>
      );
    case Permission.switchNetwork:
      return <>Allow to switch networks without notification pop-up</>;
  }
};

const toPermissionName = (permission: Permission): string => {
  switch (permission) {
    case Permission.base:
      return "Base Permission";
    case Permission.locked:
      return "Locked Permission";
    case Permission.switchNetwork:
      return "Network Permission";
  }
};

const PermissionView: FC<{
  permission: Permission;
  selected: boolean;
  onSelect: (value: boolean) => void;
  disabled: boolean;
}> = ({ permission, selected, onSelect, disabled }) => {
  return (
    <Label key={permission}>
      <input
        type="checkbox"
        checked={selected}
        disabled={disabled}
        onChange={() => onSelect(!selected)}
      />
      <Column>
        <Row>
          <b>{toPermissionName(permission)}</b>
        </Row>
        <div>
          <PermissionDescription permission={permission} />
        </div>
      </Column>
    </Label>
  );
};

interface ConfirmProps {
  id: number;
  logo?: string;
  origin: string;
  addresses: string[];
  onBack: () => void;
  onOk: () => void;
}

export const ConfirmPermission: FC<ConfirmProps> = ({
  id,
  logo,
  origin,
  addresses,
  onBack,
  onOk,
}) => {
  const { mutateAsync, isLoading } = useAddConnectionMutation();

  const [permissions, setPermissions] = useState<Permission[]>([
    Permission.base,
  ]);

  const onConnect = async () => {
    await mutateAsync({
      id,
      origin,
      wallets: addresses,
      logo: logo ?? null,
      permissions,
    });
    onOk();
  };

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Connect With OpenMask</H1>
        <Text>Address: {addresses.map(toShortAddress).join(", ")}</Text>
        <Text>Allow this site to:</Text>
      </Center>
      <Scroll>
        {PermissionList.map((item) => {
          return (
            <PermissionView
              key={item}
              permission={item}
              disabled={item === Permission.base}
              selected={permissions.includes(item)}
              onSelect={(value) => {
                if (value) {
                  setPermissions((permissions) => permissions.concat([item]));
                } else {
                  setPermissions((permissions) =>
                    permissions.filter((permission) => permission !== item)
                  );
                }
              }}
            />
          );
        })}
      </Scroll>
      <Gap />
      <ButtonBottomRow>
        <ButtonNegative onClick={onBack} disabled={isLoading}>
          Back
        </ButtonNegative>
        <ButtonPositive onClick={onConnect} disabled={isLoading}>
          Connect
        </ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};
