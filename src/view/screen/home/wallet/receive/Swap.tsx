import { useContext } from "react";
import styled from "styled-components";
import ExtensionPlatform from "../../../../../libs/service/extension";
import {
  ButtonNegative,
  Container,
  H3,
  Text,
} from "../../../../components/Components";
import { HomeButton } from "../../../../components/HomeButton";
import { LinkIcon } from "../../../../components/Icons";
import { NetworkContext } from "../../../../context";
import { Dedust, StealthEX } from "./Icons";

const Body = styled(Container)`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

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

const ChangeHero = styled.div`
  background: #2f92f6;
  border-radius: 5px;
  padding: 5px;
`;

const SwapIndex = () => {
  const network = useContext(NetworkContext);

  return (
    <div>
      <Source>
        <Row>
          <Dedust />
          <SubTitle>DeDust.io</SubTitle>
        </Row>
        <Text>
          The first and folk DEX in The Open Network. The service allows to swap
          TON to oUSDT, oUSDC and other altcoins.
        </Text>
        <ButtonNegative
          onClick={() =>
            ExtensionPlatform.openTab({
              url: `https://dedust.io/dex/swap?utm_source=openmask.app`,
            })
          }
        >
          Continue to DeDust.io <LinkIcon />
        </ButtonNegative>
      </Source>
      <Source>
        <Row>
          <img
            src="https://static.ston.fi/favicon/favicon-32x32.png"
            width="30"
          />
          <SubTitle>ston.fi</SubTitle>
        </Row>
        <Text>An AMM DEX for the TON blockchain</Text>
        <ButtonNegative
          onClick={() =>
            ExtensionPlatform.openTab({
              url: `https://app.ston.fi/swap?utm_source=openmask.app`,
            })
          }
        >
          Continue to ston.fi <LinkIcon />
        </ButtonNegative>
      </Source>
      <Source>
        <Row>
          <StealthEX />
          <SubTitle>StealthEX</SubTitle>
        </Row>
        <Text>
          StealthEX is an instant cryptocurrency exchange for limitless swaps.
          Cross-chain ETH, BTC, BNB, TRON and other networks cross-crypto swaps.
        </Text>
        <ButtonNegative
          title={network != "mainnet" ? "Please switch to mainnet!" : undefined}
          disabled={network != "mainnet"}
          onClick={() =>
            ExtensionPlatform.openTab({
              url: `https://stealthex.io/?ref=${process.env.REACT_APP_STEALTHEX_ID}&from=ton&to=btc`,
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
              url: `https://changehero.io/?ref=${process.env.REACT_APP_CHANGEHERO}&cur_from=TON `,
            })
          }
        >
          Continue to ChangeHero <LinkIcon />
        </ButtonNegative>
      </Source>
    </div>
  );
};

export const SwapRouter = () => {
  return (
    <>
      <HomeButton />
      <Body>
        <SwapIndex />
      </Body>
    </>
  );
};
