import {Body, ButtonNegative, ButtonPositive, ButtonRow, Center, Gap, H1, Text} from "../../../components/Components";
import {DAppBadge} from "../../../components/DAppBadge";
import {FC, useCallback} from "react";
import {NotificationFields} from "../../../../libs/event";
import {sendBackground} from "../../../event";
import {useDecryptMutation} from "./api";

export const DecryptMessage: FC<
  NotificationFields<"decryptMessage", any> & { onClose: () => void }
> = ({ id, logo, origin, data, onClose }) => {
  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
    onClose();
  }, [id]);

  const { isLoading, mutateAsync } = useDecryptMutation();
  const onDecrypt = async () => {
    const decryptedMessage = await mutateAsync({
      message: data.data,
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
    <Gap />
    <ButtonRow>
      <ButtonNegative onClick={onBack} disabled={isLoading}>
        Cancel
      </ButtonNegative>
      <ButtonPositive onClick={onDecrypt} disabled={isLoading}>
        Sign
      </ButtonPositive>
    </ButtonRow>
  </Body>);
};
