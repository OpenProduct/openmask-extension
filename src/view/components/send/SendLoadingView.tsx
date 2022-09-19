import { useQueryClient } from "@tanstack/react-query";
import React, { FC, useContext, useEffect } from "react";
import { NetworkContext } from "../../context";
import { askBackground, sendBackground } from "../../event";
import { Body, Center, Gap, H1, Text } from "../Components";
import { LoadingLogo } from "../Logo";

export interface Props {
  seqNo: string;
  onConfirm: () => void;
  address: string;
}
const timeout = 60 * 1000; // 60 sec

export const SendLoadingView: FC<Props> = React.memo(
  ({ seqNo, onConfirm, address }) => {
    const client = useQueryClient();
    const network = useContext(NetworkContext);

    useEffect(() => {
      askBackground<void>(timeout)
        .message("confirmSeqNo", parseInt(seqNo))
        .then(() => {
          sendBackground.message("accountsChanged", [address]);
          client.invalidateQueries([network, address]);
          onConfirm();
        });
    }, [seqNo, onConfirm, client, network, address]);

    return (
      <Body>
        <Gap />
        <LoadingLogo />
        <Center>
          <H1>Await confirmation</H1>
          <Text>~15 sec</Text>
        </Center>
        <Gap />
      </Body>
    );
  }
);
