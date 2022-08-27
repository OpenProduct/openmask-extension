import React, { FC, useContext } from "react";
import styled from "styled-components";
import TonWeb from "tonweb";
import {
  TonWebTransaction,
  TonWebTransactionMessage,
} from "../../../../../libs/entries/transaction";
import ExtensionPlatform from "../../../../../libs/service/extension";
import { ButtonLink } from "../../../../components/Components";
import { LinkIcon, ReceiveIcon, SendIcon } from "../../../../components/Icons";
import { WalletAddressContext } from "../../../../context";
import { formatTonValue, toShortAddress } from "../../../../lib/wallet";
import { useNetworkConfig } from "../../api";
import { useTransactions } from "./api";

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

const Loading = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 50px;
  border-bottom: 2px solid ${(props) => props.theme.gray};
`;

const Comment = styled.div`
  margin-top: ${(props) => props.theme.padding};
  padding: 5px 10px;
  background: ${(props) => props.theme.lightGray};
  font-size: medium;
  border-radius: 20xp;
`;

const getComment = (msg: TonWebTransactionMessage) => {
  if (!msg.msg_data) return "";
  if (msg.msg_data["@type"] !== "msg.dataText") return "";
  const base64 = msg.msg_data.text;
  return new TextDecoder().decode(TonWeb.utils.base64ToBytes(base64));
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
            {getComment(out) && <Comment>{getComment(out)}</Comment>}
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
            {getComment(item.in_msg) && (
              <Comment>{getComment(item.in_msg)}</Comment>
            )}
          </Text>
        </Block>
      )}
    </>
  );
});

export const Activities = () => {
  const config = useNetworkConfig();
  const address = useContext(WalletAddressContext);
  const { data, isLoading } = useTransactions();

  return (
    <>
      {isLoading && <Loading>Loading...</Loading>}
      {data?.map((item) => (
        <Transaction key={item.transaction_id.hash} item={item} />
      ))}
      <Row>
        <ButtonLink
          onClick={() =>
            ExtensionPlatform.openTab({
              url: `${config.scanUrl}/address/${address}`,
            })
          }
        >
          View more on tonscan.org <LinkIcon />
        </ButtonLink>
      </Row>
    </>
  );
};
