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
import { StealthEX } from "./Icons";

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

const ChangeHero = styled.div`
  background: #2f92f6;
  border-radius: 5px;
  padding: 5px;
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
          <StealthEX />
          <SubTitle>StealthEX</SubTitle>
        </Row>
        <Text>
          StealthEX is an instant cryptocurrency exchange for limitless swaps.
          Service is free from registration and does not store user’s funds on
          the platform.
        </Text>
        <ButtonNegative
          title={network != "mainnet" ? "Please switch to mainnet!" : undefined}
          disabled={network != "mainnet"}
          onClick={() =>
            ExtensionPlatform.openTab({
              url: `https://stealthex.io/?ref=${process.env.REACT_APP_STEALTHEX_ID}&from=usd&to=ton`,
            })
          }
        >
          Continue to StealthEX <LinkIcon />
        </ButtonNegative>
      </Source>
      <Source>
        <Row>
          <ChangeHero>
            <img
              src="https://pretty-picture.s3.eu-central-1.amazonaws.com/logo_bf4f0a8ce6.svg"
              height="30"
            />
          </ChangeHero>
        </Row>
        <Text>
          ChangeHero is an instant cryptocurrency exchange, cross-chain swap
          service. Instantly Convert Bitcoin And Over 150 Popular Cryptos.
        </Text>
        <ButtonNegative
          title={network != "mainnet" ? "Please switch to mainnet!" : undefined}
          disabled={network != "mainnet"}
          onClick={() =>
            ExtensionPlatform.openTab({
              url: `https://changehero.io/?ref=b803de09bf6b4cbdb36d14974b3c6ad8&to=TON`,
            })
          }
        >
          Continue to ChangeHero <LinkIcon />
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
