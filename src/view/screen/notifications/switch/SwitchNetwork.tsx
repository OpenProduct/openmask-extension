import { useContext, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
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

export const SwitchNetwork = () => {
  const [searchParams] = useSearchParams();
  const origin = decodeURIComponent(searchParams.get("origin") ?? "");
  const logo = decodeURIComponent(searchParams.get("logo") ?? "");

  const id = parseInt(searchParams.get("id") ?? "0", 10);

  const network = searchParams.get("network");
  const current = useContext(NetworkContext);

  useEffect(() => {
    if (!network) {
      sendBackground.message("rejectRequest", id);
    }
  }, []);

  const { mutate, isLoading } = useSwitchNetworkMutation();
  const onCancel = () => {
    sendBackground.message("rejectRequest", id);
  };

  const onSwitch = () => {
    mutate({ id, network: network! });
  };
  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Switch wallet network</H1>
        <Text>Allow this site to switch the network?</Text>

        <Text>
          This will switch the selected network within OpenMask to a previously
          added network:
        </Text>
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
