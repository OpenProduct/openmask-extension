import { FC, useContext } from "react";
import styled from "styled-components";
import {
  DeployInputParams,
  DeployOutputParams,
} from "../../../../libs/entries/transactionMessage";
import { NotificationFields } from "../../../../libs/event";
import { AddressTransfer } from "../../../components/Address";
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
import { useEstimateFee, useSendMutation } from "../../home/wallet/send/api";
import { useDeployContractMutation } from "./api";

const Label = styled.div`
  margin: ${(props) => props.theme.padding} 0 5px;
`;

const RawData = styled.div`
  padding: 10px;
  background: ${(props) => props.theme.lightGray};
  font-size: medium;
  margin-bottom: ${(props) => props.theme.padding};
  word-break: break-all;
`;

export const DeployContract: FC<
  NotificationFields<"deploy", DeployInputParams> & { onClose: () => void }
> = ({ id, logo, origin, data, onClose }) => {
  const wallet = useContext(WalletStateContext);

  const {
    data: method,
    isFetching: isValidating,
    error: methodError,
  } = useDeployContractMutation(data);

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
    if (!method) return;

    await mutateAsync(method);

    const payload: DeployOutputParams = {
      walletSeqNo: method.seqno,
      newContractAddress: method.address.toString(true, true, true),
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
        right={method ? method.address.toString(true, true, true) : null}
      />

      <TextLine>Forward amount:</TextLine>
      <TextLine>
        <b>{data.amount} TON</b>
      </TextLine>

      <Fees estimation={estimation} />

      <Label>Initial Code</Label>
      <RawData>{data.initCodeCell}</RawData>

      <Label>Initial Data</Label>
      <RawData>{data.initDataCell}</RawData>

      {data.initMessageCell && (
        <>
          <Label>Initial Message</Label>
          <RawData>{data.initMessageCell}</RawData>
        </>
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
          disabled={loading || deployError != null}
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
