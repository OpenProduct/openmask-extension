import { fromNano } from "@openmask/web-sdk";
import { FC, useContext } from "react";
import {
  DeployInputParams,
  DeployOutputParams,
} from "../../../../libs/entries/transactionMessage";
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
import { WalletStateContext } from "../../../context";
import { sendBackground } from "../../../event";
import { useBalance } from "../../home/api";
import { useEstimateFee, useSendMutation } from "../../home/wallet/send/api";
import { useDeployContractMutation, useSmartContractAddress } from "./api";

export const DeployContract: FC<
  NotificationFields<"deploy", DeployInputParams> & { onClose: () => void }
> = ({ id, logo, origin, data, onClose }) => {
  const wallet = useContext(WalletStateContext);

  const { data: balance } = useBalance(wallet.address);
  const { data: address } = useSmartContractAddress(data);

  const {
    data: method,
    isFetching: isValidating,
    error: methodError,
  } = useDeployContractMutation(data, balance);

  const { data: estimation } = useEstimateFee(method);
  const {
    mutateAsync,
    isLoading: isDeploying,
    error: deployError,
  } = useSendMutation();

  const onBack = () => {
    sendBackground.message("rejectRequest", id);
    onClose();
  };

  const onDeploy = async () => {
    if (!method || !address) return;

    await mutateAsync(method);

    const payload: DeployOutputParams = {
      walletSeqNo: method.seqno,
      newContractAddress: address.toString(true, true, true),
    };

    sendBackground.message("approveRequest", {
      id,
      payload,
    });
    onClose();
  };

  const loading = isValidating || isDeploying;

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Deploy Smart Contract</H1>
        <Text>Would you like to deploy contract?</Text>
      </Center>

      <AddressTransfer
        left={wallet.name}
        right={address ? address.toString(true, true, true) : null}
      />

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

      {methodError && <ErrorMessage>{methodError.message}</ErrorMessage>}
      {deployError && <ErrorMessage>{deployError.message}</ErrorMessage>}

      <Gap />
      <ButtonRow>
        <ButtonNegative onClick={onBack} disabled={loading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive
          onClick={onDeploy}
          disabled={loading || deployError != null || methodError != null}
        >
          {isValidating ? (
            <Dots>Validating</Dots>
          ) : isDeploying ? (
            <Dots>Deploying</Dots>
          ) : (
            "Deploy"
          )}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
