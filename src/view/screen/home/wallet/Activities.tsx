import { FC, useContext } from "react";
import styled from "styled-components";
import ExtensionPlatform from "../../../../libs/extension";
import { ButtonNegative } from "../../../components/Components";
import { LinkIcon, ReceiveIcon, SendIcon } from "../../../components/Icons";
import { WalletAddressContext } from "../../../context";
import { NetworkConfig, useNetworkConfig } from "../../../lib/network";
import {
  TonWebTransaction,
  useTransactions,
} from "../../../lib/state/transaction";
import { formatTonValue, toShortAddress } from "../../../lib/wallet";

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

const Transaction: FC<{ item: TonWebTransaction; config: NetworkConfig }> = ({
  item,
  config,
}) => {
  return (
    <>
      {item.out_msgs.map((out) => (
        <Block key={out.body_hash}>
          <First>
            <SendIcon />
          </First>
          <Text>
            <Line>
              <span>Send</span>
              <span>-{formatTonValue(out.value)} TON</span>
            </Line>
            <Line>
              <b>{toShortAddress(out.destination)}</b>
              <span>{new Date(item.utime * 1000).toLocaleString()}</span>
            </Line>
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
              <span>Receive</span>
              <span>+{formatTonValue(item.in_msg.value)} TON</span>
            </Line>
            <Line>
              <b>{toShortAddress(item.in_msg.source)}</b>
              <span>{new Date(item.utime * 1000).toLocaleString()}</span>
            </Line>
          </Text>
        </Block>
      )}
    </>
  );
};

export const Activities = () => {
  const config = useNetworkConfig();
  const address = useContext(WalletAddressContext);
  const { data, isLoading } = useTransactions();

  return (
    <>
      {isLoading && <Loading>Loading...</Loading>}
      {data?.map((item) => (
        <Transaction
          key={item.transaction_id.hash}
          item={item}
          config={config}
        />
      ))}
      <Row>
        <ButtonNegative
          onClick={() =>
            ExtensionPlatform.openTab({
              url: `${config.scanUrl}/address/${address}`,
            })
          }
        >
          View more on tonscan.org <LinkIcon />
        </ButtonNegative>
      </Row>
    </>
  );
};
