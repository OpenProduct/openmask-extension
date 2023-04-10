import React, { FC, useCallback } from "react";
import { JettonParams, JettonState } from "../../../../libs/entries/asset";
import { NotificationFields } from "../../../../libs/event";
import {
  Body,
  ButtonBottomRow,
  ButtonNegative,
  ButtonPositive,
  Center,
  ErrorMessage,
  Gap,
  H1,
  Scroll,
  Text,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { JettonRow } from "../../../components/JettonRow";
import { sendBackground } from "../../../event";
import { toShortAddress } from "../../../utils";
import { Loading, NotificationView } from "../../Loading";
import {
  useAddJettonMutation,
  useJettonMinterData,
  useJettonWalletBalance,
  useOriginWallets,
} from "./api";

interface JettonWalletProps {
  wallet: string;
  id: number;
  state: JettonState;
  jettonMinterAddress: string;
}
const JettonWallet: FC<JettonWalletProps> = React.memo(
  ({ wallet, state, id, jettonMinterAddress }) => {
    const { data: jettonBallance } = useJettonWalletBalance(
      id,
      jettonMinterAddress,
      wallet
    );
    return (
      <>
        <Text>Wallet: {toShortAddress(wallet)}</Text>
        <JettonRow state={state} balance={jettonBallance?.balance} />
      </>
    );
  }
);

export const ImportJetton: FC<
  NotificationFields<"importJetton", JettonParams> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, data: params, onClose }) => {
  const { data: wallets } = useOriginWallets(origin);

  const { data, isFetching, error } = useJettonMinterData(params);

  const { mutateAsync, isLoading, error: addError } = useAddJettonMutation(id);

  const onAdd = async () => {
    if (!data) return;
    await mutateAsync({
      wallets,
      state: {
        state: data.state,
        minterAddress: params.address,
      },
    });
    onClose();
  };

  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
    onClose();
  }, [id]);

  if (isFetching) {
    return <Loading />;
  }

  if (!data || error || addError) {
    return (
      <NotificationView button="Close" action={onBack}>
        <ErrorMessage>
          {error?.message || addError?.message || "Jetton Data is not define"}
        </ErrorMessage>
      </NotificationView>
    );
  }

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Add Suggested Token</H1>
        <Text>Would you like to import these jetton?</Text>
        <Text>Jetton (Your wallet balance)</Text>
      </Center>
      <Scroll>
        {(wallets ?? []).map((wallet) => (
          <JettonWallet
            wallet={wallet}
            id={id}
            state={data.state}
            jettonMinterAddress={params.address}
          />
        ))}
      </Scroll>
      <Gap />
      <ButtonBottomRow>
        <ButtonNegative onClick={onBack} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onAdd} disabled={isLoading}>
          Add Jetton
        </ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};
