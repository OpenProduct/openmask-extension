import { FC, useCallback, useContext } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ExtensionPlatform from "../../../../../../libs/service/extension";
import {
  ActivitiesList,
  ActivityMessage,
} from "../../../../../components/ActivitiesList";
import {
  Body,
  ButtonColumn,
  ButtonNegative,
  InlineLink,
  Scroll,
  Text,
} from "../../../../../components/Components";
import { HomeButton } from "../../../../../components/HomeButton";
import {
  CheckIcon,
  CopyIcon,
  DeleteIcon,
  LinkIcon,
} from "../../../../../components/Icons";
import { Tabs } from "../../../../../components/Tabs";
import { useCopyToClipboard } from "../../../../../hooks/useCopyToClipbpard";
import { relative } from "../../../../../routes";
import { toShortAddress } from "../../../../../utils";
import { useNetworkConfig } from "../../../api";
import { useJettonTransactions } from "./api";
import { JettonMinterAddressContext, JettonStateContext } from "./context";
import { JettonBalance } from "./JettonBalance";
import { JettonRoute } from "./route";

const JettonActivities = () => {
  const state = useContext(JettonStateContext);

  const { data, isLoading } = useJettonTransactions(state);

  if (!state.walletAddress) {
    return <ActivityMessage>Jetton Wallet Not Found</ActivityMessage>;
  }

  return (
    <ActivitiesList
      data={data}
      isLoading={isLoading}
      address={state.walletAddress}
    />
  );
};

const AddressBlock = styled.span`
  cursor: pointer;
  display: inline-block;
  border-radius: 5px;
  padding: 5px;
  line-height: 1.6;

  box-sizing: border-box;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  &:hover {
    background: ${(props) => props.theme.gray};
  }
`;

const AddressLine: FC<{ address: string }> = ({ address }) => {
  const [copied, handleCopy] = useCopyToClipboard();

  return (
    <AddressBlock onClick={() => handleCopy(address)}>
      {toShortAddress(address)} {copied ? <CheckIcon /> : <CopyIcon />}
    </AddressBlock>
  );
};

const JettonInfo = () => {
  const navigate = useNavigate();
  const config = useNetworkConfig();
  const jetton = useContext(JettonStateContext);
  const minterAddress = useContext(JettonMinterAddressContext);

  return (
    <Body>
      <Text>
        <b>Jetton Minter</b>{" "}
        <InlineLink
          onClick={() =>
            ExtensionPlatform.openTab({
              url: `${config.scanUrl}/address/${minterAddress}`,
            })
          }
        >
          Open tonscan.org <LinkIcon />
        </InlineLink>
      </Text>
      <Text>
        <AddressLine address={minterAddress} />
      </Text>
      <Text>
        <b>Jetton Wallet</b>{" "}
        {jetton.walletAddress && (
          <InlineLink
            onClick={() =>
              ExtensionPlatform.openTab({
                url: `${config.scanUrl}/address/${jetton.walletAddress}`,
              })
            }
          >
            Open tonscan.org <LinkIcon />
          </InlineLink>
        )}
      </Text>
      <Text>
        {jetton.walletAddress ? (
          <AddressLine address={jetton.walletAddress} />
        ) : (
          "Jetton Wallet Not Found"
        )}
      </Text>
      <ButtonColumn>
        <ButtonNegative onClick={() => navigate(relative(JettonRoute.hide))}>
          Hide <DeleteIcon />
        </ButtonNegative>
      </ButtonColumn>
    </Body>
  );
};

const tabs = ["Activity", "Info"];

export const JettonHome = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const onChange = useCallback(
    (tab: typeof tabs[number]) => {
      navigate(
        tab === "Info"
          ? relative(JettonRoute.info)
          : relative(JettonRoute.index),
        {
          replace: true,
        }
      );
    },
    [navigate]
  );

  const active = location.pathname.includes(JettonRoute.info)
    ? tabs[1]
    : tabs[0];

  return (
    <Scroll>
      <HomeButton />
      <JettonBalance />
      <Tabs options={tabs} active={active} onChange={onChange} />
      <Routes>
        <Route path={JettonRoute.info} element={<JettonInfo />} />
        <Route path="*" element={<JettonActivities />} />
      </Routes>
    </Scroll>
  );
};
