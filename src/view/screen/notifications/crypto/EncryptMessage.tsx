import {Body, ButtonNegative, ButtonPositive, ButtonRow, Center, Gap, H1, Text} from "../../../components/Components";
import {DAppBadge} from "../../../components/DAppBadge";
import {FC, useCallback} from "react";
import {NotificationFields} from "../../../../libs/event";
import {sendBackground} from "../../../event";
import {useEncryptMutation} from "./api";

export const EncryptMessage: FC<
  NotificationFields<"encryptMessage", any> & { onClose: () => void }
> = ({ id, logo, origin, data, onClose }) => {
  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
    onClose();
  }, [id]);

  const { isLoading, mutateAsync } = useEncryptMutation();
  const onEncrypt = async () => {
    const decryptedMessage = await mutateAsync({
      message: data.data
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
