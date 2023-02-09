import { base64ToBytes } from "@openproduct/web-sdk";
import React, { FC, useMemo } from "react";
import styled from "styled-components";
import {
  TonWebTransaction,
  TonWebTransactionMessage,
} from "../../libs/entries/transaction";
import ExtensionPlatform from "../../libs/service/extension";
import { useSelectedNetworkConfig } from "../screen/home/api";
import { formatTonValue, toShortAddress } from "../utils";
import { ButtonLink } from "./Components";
import { LinkIcon, ReceiveIcon, SendIcon } from "./Icons";

const Row = styled.div`
  padding: ${(props) => props.theme.padding};
`;

const Block = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  border-bottom: 2px solid ${(props) => props.theme.gray};
`;

const Image = styled.div`
  shrink: 0;
  padding: ${(props) => props.theme.padding};
  display: flex;
  align-items: center;
`;

const First = styled(Image)`
  color: ${(props) => props.theme.darkGray};
  font-size: 200%;
`;
const Text = styled.div`
  flex-grow: 1;
  padding: ${(props) => props.theme.padding};
  display: flex;
  justify-content: center;
  line-height: 1.5;
  flex-direction: column;
`;

const Line = styled.div`
  display: flex;
  justify-content: space-between;
`;

export const ActivityMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;
  border-bottom: 2px solid ${(props) => props.theme.gray};
`;

const CommentLabel = styled.div`
  margin-bottom: 5px;
  color: ${(props) => props.theme.darkGray};
  font-weight: bold;
  font-size: 0.75rem;
`;

const Comment = styled.div`
  margin-top: ${(props) => props.theme.padding};
  padding: 5px 10px;
  background: ${(props) => props.theme.lightGray};
  font-size: medium;
  word-break: break-all;
`;

const decodeText = (value: string): string => {
  return new TextDecoder().decode(base64ToBytes(value));
};

const CommentBlock: FC<{ msg: TonWebTransactionMessage }> = ({ msg }) => {
  const [hasComment, encrypted, value] = useMemo(() => {
    if (
      msg.msg_data["@type"] === "msg.dataRaw" &&
      msg.msg_data.openmask_decrypted_payload
    ) {
      return [
        true,
        true,
        decodeText(msg.msg_data.openmask_decrypted_payload),
      ] as const;
    }
    if (msg.msg_data["@type"] === "msg.dataText") {
      return [true, false, decodeText(msg.msg_data.text)] as const;
    }
    return [false, false, ""] as const;
  }, [msg]);

  if (!hasComment) return <></>;

  if (encrypted) {
    return (
      <Comment>
        <CommentLabel>E2E encrypted message</CommentLabel>
        {value}
      </Comment>
    );
  } else {
    return <Comment>{value}</Comment>;
  }
};

const Transaction: FC<{ item: TonWebTransaction }> = React.memo(({ item }) => {
  return (
    <>
      {item.out_msgs.map((out) => (
        <Block key={out.body_hash}>
          <First>
            <SendIcon />
          </First>
          <Text>
            <Line>
              <b>Send</b>
              <span>-{formatTonValue(out.value)} TON</span>
            </Line>
            <Line>
              <span>{toShortAddress(out.destination)}</span>
              <span>{new Date(item.utime * 1000).toLocaleString()}</span>
            </Line>
            <CommentBlock msg={out} />
          </Text>
        </Block>
      ))}
      {item.in_msg && item.in_msg.source && (
        <Block>
          <First>
            <ReceiveIcon />
          </First>
          <Text>
            <Line>
              <b>Receive</b>
              <span>+{formatTonValue(item.in_msg.value)} TON</span>
            </Line>
            <Line>
              <span>{toShortAddress(item.in_msg.source)}</span>
              <span>{new Date(item.utime * 1000).toLocaleString()}</span>
            </Line>
            <CommentBlock msg={item.in_msg} />
          </Text>
        </Block>
      )}
    </>
  );
});

export interface ActivitiesProps {
  isLoading: boolean;
  address?: string;
  data?: TonWebTransaction[];
}

export const ActivitiesList: FC<ActivitiesProps> = ({
  isLoading,
  data,
  address,
}) => {
  const config = useSelectedNetworkConfig();

  return (
    <>
      {isLoading && <ActivityMessage>Loading...</ActivityMessage>}
      {data?.map((item) => (
        <Transaction key={item.transaction_id.hash} item={item} />
      ))}
      {address && (
        <Row>
          <ButtonLink
            onClick={() =>
              ExtensionPlatform.openTab({
                url: `${config.scanUrl}${address}`,
              })
            }
          >
            View more in explorer <LinkIcon />
          </ButtonLink>
        </Row>
      )}
    </>
  );
};
