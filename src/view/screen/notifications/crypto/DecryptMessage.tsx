import {
  Body, ButtonNegative, ButtonPositive,
  ButtonRow, Center, Gap, H1, Text
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { FC, useCallback } from "react";
import { NotificationFields } from "../../../../libs/event";
import { sendBackground } from "../../../event";
import {useDecryptMutation, useGetAddress} from "./api";
import { DecryptMessageInputParams } from "../../../../libs/entries/notificationMessage";
import { AddressBlock } from "../../../components/AddressBlock";

export const DecryptMessage: FC<
  NotificationFields<"decryptMessage", DecryptMessageInputParams> & { onClose: () => void }
> = ({ id, logo, origin, data, onClose }) => {
  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
    onClose();
  }, [id]);

  const { isLoading, mutateAsync } = useDecryptMutation();
  const { isLoading: loadingSender, data: senderAddress } = useGetAddress(data.senderPublicKey);

  const onDecrypt = async () => {
    const decryptedMessage = await mutateAsync({
      message: data.message,
      senderPublicKey: data.senderPublicKey
    });
    sendBackground.message("approveRequest", { id, payload: decryptedMessage });
    onClose();
  };


  return(<Body>
    <Center>
      <DAppBadge logo={logo} origin={origin} />
      <H1>Decrypt message</H1>
      <Text>Would you like to decrypt message?</Text>
    </Center>

    <AddressBlock label="Sender" address={senderAddress} />

    <Gap />
    <ButtonRow>
      <ButtonNegative onClick={onBack} disabled={isLoading}>
        Cancel
      </ButtonNegative>
      <ButtonPositive onClick={onDecrypt} disabled={isLoading}>
        Decrypt
      </ButtonPositive>
    </ButtonRow>
  </Body>);
};
