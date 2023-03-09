import { Address, formatTransferUrl } from "@openproduct/web-sdk";
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
  H3,
  Text,
} from "../../../../components/Components";
import { HomeButton } from "../../../../components/HomeButton";
import {
  CheckIcon,
  CopyIcon,
  LinkIcon,
  TonIcon,
} from "../../../../components/Icons";
import {
  NetworkContext,
  WalletAddressContext,
  WalletStateContext,
} from "../../../../context";
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

const Source = styled.div`
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
  margin-bottom: 1rem;
  padding-bottom: 1rem;
`;

const Row = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  padding-bottom: 0.5rem;
`;

const SubTitle = styled(H3)`
  margin: 0;
`;

const NetworkLogo = styled.span`
  font-size: 2em;
`;

const ReceiveIndex = () => {
  const navigate = useNavigate();
  const wallet = useContext(WalletStateContext);
  const network = useContext(NetworkContext);
  const address = new Address(wallet.address).toString(true, true, true);
  return (
    <div>
      <Source>
        <Row>
          <img src="https://cryptogas.shop/images/logo_v3.svg" width="30" />
          <SubTitle>CryptoGas.shop</SubTitle>
        </Row>
        <Text>
          Buy TON for crypto. MixPay supports users paying cross-wallet,
          cross-chain and cross-crypto to buy TON. Payment in ETH, BTC, BNB,
          TRON and other networks.
        </Text>
        <ButtonNegative
          title={network != "mainnet" ? "Please switch to mainnet!" : undefined}
          disabled={network != "mainnet"}
          onClick={() =>
            ExtensionPlatform.openTab({
              url: `https://cryptogas.shop/ton?ref=${process.env.REACT_APP_MIXIN_ID}&address=${address}`,
            })
          }
        >
          Continue to CryptoGas.shop <LinkIcon />
        </ButtonNegative>
      </Source>
      <Source>
        <Row>
          <NetworkLogo>
            <TonIcon />
          </NetworkLogo>
          <SubTitle>Directly deposit TON</SubTitle>
        </Row>
        <Text>
          If you already have some TON, the quickest way to get TON in your new
          wallet by direct deposit.
        </Text>
        <ButtonNegative onClick={() => navigate(`.${ReceiveRoutes.ton}`)}>
          Receive TON
        </ButtonNegative>
      </Source>
    </div>
  );
};

const TextRow = styled.div`
  color: ${(props) => props.theme.darkGray};
`;

const AddressRow = styled.div`
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
      <TextRow>
        Share this address to receive {symbol} in The Open Network
      </TextRow>
      <AddressRow onClick={() => handleCopy(address)}>{address}</AddressRow>
      <ButtonNegative onClick={() => handleCopy(address)}>
        Copy {copied ? <CheckIcon /> : <CopyIcon />}
      </ButtonNegative>
    </ButtonColumn>
  );
};

export const ReceiveTonPage = () => {
  return (
    <>
      <HomeButton />
      <Body>
        <ReceiveCoin />
      </Body>
    </>
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
