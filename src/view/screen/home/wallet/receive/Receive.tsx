import { formatTransferUrl } from "@openmask/web-sdk";
import { FC, useContext } from "react";
import QRCode from "react-qr-code";
import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ExtensionPlatform from "../../../../../libs/service/extension";
import {
  ButtonColumn,
  ButtonNegative,
  Container,
  H1,
} from "../../../../components/Components";
import { HomeButton } from "../../../../components/HomeButton";
import { CheckIcon, CopyIcon, LinkIcon } from "../../../../components/Icons";
import { WalletAddressContext } from "../../../../context";
import { useCopyToClipboard } from "../../../../hooks/useCopyToClipbpard";

const Body = styled(Container)`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

enum ReceiveRoutes {
  index = "/",
  ton = "/ton",
}

const ReceiveIndex = () => {
  const navigate = useNavigate();
  return (
    <ButtonColumn>
      <ButtonNegative
        onClick={() =>
          ExtensionPlatform.openTab({ url: "https://ton.org/bridge/" })
        }
      >
        ETH bridge <LinkIcon />
      </ButtonNegative>
      <ButtonNegative onClick={() => navigate(`.${ReceiveRoutes.ton}`)}>
        Receive TON
      </ButtonNegative>
    </ButtonColumn>
  );
};

const Text = styled.div`
  color: ${(props) => props.theme.darkGray};
`;

const Address = styled.div`
  cursor: pointer;
  font-size: large;
  width: 100%;
  word-break: break-all;
`;

const Block = styled.div`
  padding: ${(props) => props.theme.padding} 0;
  margin: 0 auto;
`;

interface ReceiveProps {
  symbol?: string;
}

const Title = styled(H1)`
  margin: 0;
`;

export const ReceiveCoin: FC<ReceiveProps> = ({ symbol = "TON" }) => {
  const address = useContext(WalletAddressContext);
  const [copied, handleCopy] = useCopyToClipboard();

  return (
    <ButtonColumn>
      <Title>Receive {symbol}</Title>
      {symbol === "TON" && (
        <Block>
          <QRCode size={160} value={formatTransferUrl(address)} />
        </Block>
      )}
      <Text>Share this address to receive {symbol} in The Open Network</Text>
      <Address onClick={() => handleCopy(address)}>{address}</Address>
      <ButtonNegative onClick={() => handleCopy(address)}>
        Copy {copied ? <CheckIcon /> : <CopyIcon />}
      </ButtonNegative>
    </ButtonColumn>
  );
};

export const ReceiveRouter = () => {
  return (
    <>
      <HomeButton />
      <Body>
        <Routes>
          <Route path={ReceiveRoutes.ton} element={<ReceiveCoin />} />
          <Route path={ReceiveRoutes.index} element={<ReceiveIndex />} />
        </Routes>
      </Body>
    </>
  );
};
