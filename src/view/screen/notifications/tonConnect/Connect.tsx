import { FC, useContext, useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import { TonConnectRequest } from "../../../../libs/entries/notificationMessage";
import { WalletState } from "../../../../libs/entries/wallet";
import { NotificationFields } from "../../../../libs/event";
import {
  Body,
  ButtonBottomRow,
  ButtonNegative,
  ButtonPositive,
  Center,
  Gap,
  H1,
  Scroll,
  Text,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { Dots } from "../../../components/Dots";
import { AccountStateContext } from "../../../context";
import { sendBackground } from "../../../event";
import { FingerprintWalletLabel } from "../../../FingerprintLabel";
import { formatTonValue } from "../../../utils";
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

const Wallet: FC<{
  wallet: WalletState;
  selected: boolean;
  onSelect: (address: string) => void;
}> = ({ wallet, selected, onSelect }) => {
  const { data } = useBalance(wallet.address);

  return (
    <Label key={wallet.address}>
      <input
        type="radio"
        checked={selected}
        onChange={() => onSelect(wallet.address)}
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

export const ConnectRequest: FC<
  NotificationFields<"tonConnectRequest", TonConnectRequest> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, onClose, data }) => {
  const account = useContext(AccountStateContext);

  const [selectedWallet, setSelected] = useState(account.activeWallet);

  const { mutateAsync, isLoading } = useAddConnectionMutation();

  useEffect(() => {
    if (!origin) {
      sendBackground.message("rejectRequest", id);
      onClose();
    }
  }, []);

  const onCancel = () => {
    sendBackground.message("rejectRequest", id);
    onClose();
  };

  const onConnect = async () => {
    if (!selectedWallet) return;
    await mutateAsync({
      id,
      origin,
      wallet: selectedWallet,
      logo: logo ?? null,
      data,
    });
    onClose();
  };

  const [wallet] = useMemo(() => {
    return account.wallets.filter((item) => item.address === selectedWallet);
  }, [account, selectedWallet]);

  const isSignature = useMemo(
    () => data.items.some((item) => item.name === "ton_proof"),
    [data]
  );

  const disableConnect = isLoading || (isSignature && wallet.isLadger);
  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Ton Connect With OpenMask</H1>
        <Text>Select the account(s) to use on this site</Text>
      </Center>
      <Scroll>
        {account.wallets.map((wallet) => (
          <Wallet
            key={wallet.address}
            wallet={wallet}
            selected={selectedWallet === wallet.address}
            onSelect={setSelected}
          />
        ))}
      </Scroll>
      <Gap />
      <ButtonBottomRow>
        <ButtonNegative onClick={onCancel} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onConnect} disabled={disableConnect}>
          {isLoading ? (
            <Dots>Loading</Dots>
          ) : (
            <FingerprintWalletLabel isSignature={isSignature} wallet={wallet}>
              {isSignature && wallet.isLadger ? "Not Supported" : "Connect"}
            </FingerprintWalletLabel>
          )}
        </ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};
