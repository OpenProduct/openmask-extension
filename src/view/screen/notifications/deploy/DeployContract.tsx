import { fromNano } from "@openproduct/web-sdk";
import { FC, useContext, useMemo } from "react";
import {
  DeployInputParams,
  DeployOutputParams,
} from "../../../../libs/entries/notificationMessage";
import { NotificationFields } from "../../../../libs/event";
import { AddressTransfer } from "../../../components/Address";
import { CodeBlock } from "../../../components/CodeBlock";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Center,
  ErrorMessage,
  Gap,
  H1,
  Text,
  TextLine,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { Dots } from "../../../components/Dots";
import { Fees } from "../../../components/send/Fees";
import { NetworkContext, WalletStateContext } from "../../../context";
import { sendBackground } from "../../../event";
import { FingerprintLabel } from "../../../FingerprintLabel";
import { toDeployState, useEstimateDeploy, useSendDeploy } from "./api";

export const DeployContract: FC<
  NotificationFields<"deploy", DeployInputParams> & { onClose: () => void }
> = ({ id, logo, origin, data, onClose }) => {
  const wallet = useContext(WalletStateContext);
  const network = useContext(NetworkContext);

  const state = useMemo(() => toDeployState(data, network), [data, network]);
  const { data: estimation } = useEstimateDeploy(state);

  const {
    mutateAsync,
    isLoading: isDeploying,
    error: deployError,
  } = useSendDeploy(state);

  const onBack = () => {
    sendBackground.message("rejectRequest", id);
    onClose();
  };

  const onDeploy = async () => {
    const seqno = await mutateAsync();

    const payload: DeployOutputParams = {
      walletSeqNo: seqno,
      newContractAddress: state.address.toString(),
    };

    sendBackground.message("approveRequest", {
      id,
      payload,
    });
    onClose();
  };

  const loading = isDeploying;

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Deploy Smart Contract</H1>
        <Text>Would you like to deploy contract?</Text>
      </Center>

      <AddressTransfer left={wallet.name} right={state.address.toString()} />

      <TextLine>Forward amount:</TextLine>
      <TextLine>
        <b>{fromNano(data.amount)} TON</b>
      </TextLine>

      <Fees estimation={estimation} />

      <CodeBlock label="Initial Code">{data.initCodeCell}</CodeBlock>
      <CodeBlock label="Initial Data">{data.initDataCell}</CodeBlock>

      {data.initMessageCell && (
        <CodeBlock label="Initial Message">{data.initMessageCell}</CodeBlock>
      )}

      {deployError && <ErrorMessage>{deployError.message}</ErrorMessage>}

      <Gap />
      <ButtonRow>
        <ButtonNegative onClick={onBack} disabled={loading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive
          onClick={onDeploy}
          disabled={loading || deployError != null}
        >
          {isDeploying ? (
            <Dots>Deploying</Dots>
          ) : (
            <FingerprintLabel>Deploy</FingerprintLabel>
          )}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
