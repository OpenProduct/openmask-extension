import { useContext } from "react";
import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ExtensionPlatform from "../../../../../libs/extension";
import {
  ButtonColumn,
  ButtonNegative,
  Container,
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

const Title = styled.div`
  font-size: x-large;
`;

const Text = styled.div`
  color: ${(props) => props.theme.darkGray};
`;

const Address = styled.div`
  cursor: pointer;
  font-size: large;
  width: 100%;
  word-break: break-all;
`;

const ReceiveTon = () => {
  const address = useContext(WalletAddressContext);
  const [copied, handleCopy] = useCopyToClipboard();

  return (
    <ButtonColumn>
      <Title>Receive TON</Title>
      <Text>Share this address to receive TON</Text>
      <Address onClick={() => handleCopy(address)}>{address}</Address>
      <ButtonNegative onClick={() => handleCopy(address)}>
        Copy {copied ? <CheckIcon /> : <CopyIcon />}
      </ButtonNegative>
    </ButtonColumn>
  );
};

export const Receive = () => {
  return (
    <>
      <HomeButton />
      <Body>
        <Routes>
          <Route path={ReceiveRoutes.ton} element={<ReceiveTon />} />
          <Route path={ReceiveRoutes.index} element={<ReceiveIndex />} />
        </Routes>
      </Body>
    </>
  );
};
