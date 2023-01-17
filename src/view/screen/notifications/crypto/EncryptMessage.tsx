import {
  Body, ButtonNegative, ButtonPositive,
  ButtonRow, Center, Gap, H1, Text
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { FC, useCallback } from "react";
import { NotificationFields } from "../../../../libs/event";
import { sendBackground } from "../../../event";
import { useEncryptMutation, useGetAddress } from "./api";
import { EncryptMessageInputParams } from "../../../../libs/entries/notificationMessage";
import { AddressBlock } from "../../../components/AddressBlock";

export const EncryptMessage: FC<
  NotificationFields<"encryptMessage", EncryptMessageInputParams> & { onClose: () => void }
> = ({ id, logo, origin, data, onClose }) => {
  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
    onClose();
  }, [id]);

  const { isLoading, mutateAsync } = useEncryptMutation();
  const { isLoading: loadingReceiver, data: receiverAddress } = useGetAddress(data.receiverPublicKey);
  const onEncrypt = async () => {
    const decryptedMessage = await mutateAsync({
      message: data.message,
      receiverPublicKey: data.receiverPublicKey
    });
    sendBackground.message("approveRequest", { id, payload: decryptedMessage });
    onClose();
  };

  return(<Body>
    <Center>
      <DAppBadge logo={logo} origin={origin} />
      <H1>Encrypt message</H1>
      <Text>Would you like to encrypt data?</Text>
    </Center>

    <AddressBlock label="Receiver" address={receiverAddress}/>

    <Gap />

    <ButtonRow>
      <ButtonNegative onClick={onBack} disabled={isLoading}>
        Cancel
      </ButtonNegative>
      <ButtonPositive onClick={onEncrypt} disabled={isLoading}>
        Encrypt
      </ButtonPositive>
    </ButtonRow>
  </Body>);
};
