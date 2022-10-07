import { FC, useContext } from "react";
import { SwitchNetworkParams } from "../../../../libs/entries/notificationMessage";
import { NotificationFields } from "../../../../libs/event";
import { AddressTransfer } from "../../../components/Address";
import {
  Body,
  ButtonBottomRow,
  ButtonNegative,
  ButtonPositive,
  Center,
  Gap,
  H1,
  Text,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { NetworkContext } from "../../../context";
import { sendBackground } from "../../../event";
import { useSwitchNetworkMutation } from "./api";

export const SwitchNetwork: FC<
  NotificationFields<"switchNetwork", SwitchNetworkParams> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, data: { network }, onClose }) => {
  const current = useContext(NetworkContext);

  const { mutateAsync, isLoading } = useSwitchNetworkMutation();
  const onCancel = () => {
    sendBackground.message("rejectRequest", id);
    onClose();
  };

  const onSwitch = async () => {
    await mutateAsync({ id, network });
    onClose();
  };

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Switch wallet network</H1>
        <Text>Allow this site to switch the network?</Text>
        <Text>This will switch the OpenMask network:</Text>
      </Center>
      <AddressTransfer left={current} right={network} />
      <Gap />
      <ButtonBottomRow>
        <ButtonNegative onClick={onCancel} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onSwitch} disabled={isLoading}>
          Switch
        </ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};
