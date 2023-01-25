import { FC, useCallback } from "react";
import { DecryptMessageInputParams } from "../../../../libs/entries/notificationMessage";
import { NotificationFields } from "../../../../libs/event";
import { AddressBlock } from "../../../components/AddressBlock";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Center,
  Gap,
  H1,
  Text,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { FingerprintIcon } from "../../../components/Icons";
import { sendBackground } from "../../../event";
import { useAuthConfiguration } from "../../settings/api";
import { useDecryptMutation, useGetAddress } from "./api";

export const DecryptMessage: FC<
  NotificationFields<"decryptMessage", DecryptMessageInputParams> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, data, onClose }) => {
  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
    onClose();
  }, [id]);

  const { isLoading, mutateAsync } = useDecryptMutation();
  const { isLoading: loadingSender, data: senderAddress } = useGetAddress(
    data.senderPublicKey
  );

  const { data: auth } = useAuthConfiguration();
  const isWebAuth = auth?.kind == "webauthn";

  const onDecrypt = async () => {
    const decryptedMessage = await mutateAsync({
      message: data.message,
      senderPublicKey: data.senderPublicKey,
    });
    sendBackground.message("approveRequest", { id, payload: decryptedMessage });
    onClose();
  };

  return (
    <Body>
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
        <ButtonPositive
          onClick={onDecrypt}
          disabled={isLoading || loadingSender}
        >
          Decrypt {isWebAuth && <FingerprintIcon />}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
