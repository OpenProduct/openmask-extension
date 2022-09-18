import { FC, useCallback, useContext } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  ActivitiesList,
  ActivityMessage,
} from "../../../../../components/ActivitiesList";
import { Body, Scroll, Text } from "../../../../../components/Components";
import { HomeButton } from "../../../../../components/HomeButton";
import { CheckIcon, CopyIcon } from "../../../../../components/Icons";
import { Tabs } from "../../../../../components/Tabs";
import { useCopyToClipboard } from "../../../../../hooks/useCopyToClipbpard";
import { relative } from "../../../../../routes";
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

  max-width: 100%;
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
      {copied ? <CheckIcon /> : <CopyIcon />} {address}
    </AddressBlock>
  );
};

const JettonInfo = () => {
  const jetton = useContext(JettonStateContext);
  const minterAddress = useContext(JettonMinterAddressContext);

  const onDelete = () => {};

  const isLoading = false;

  return (
    <Body>
      <Text>Jetton Minter</Text>
      <Text>
        <AddressLine address={minterAddress} />
      </Text>
      <Text>Jetton Wallet</Text>
      <Text>
        {jetton.walletAddress ? (
          <AddressLine address={minterAddress} />
        ) : (
          "Jetton Wallet Not Found"
        )}
      </Text>
    </Body>
    // <SecondBlock>
    //   <WalletName address={} name="" />
    //   { ? (
    //     <WalletName address={jetton.walletAddress} name="Jetton Wallet" />
    //   ) : (
    //     <EmptyWalletName name="Jetton Wallet" />
    //   )}
    //   <DropDown
    //     payload={() => (
    //       <DropDownListPayload>
    //         <ListTitle>Are you sure you want to hide jetton?</ListTitle>
    //         <ListItem onClick={onDelete}>
    //           {isLoading ? "Hiding..." : "Hide"}
    //         </ListItem>
    //       </DropDownListPayload>
    //     )}
    //   >
    //     <Icon>
    //       <DeleteIcon />
    //     </Icon>
    //   </DropDown>
    // </SecondBlock>
  );
};

const tabs = ["Info", "Activity"];

export const JettonHome = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const onChange = useCallback(
    (tab: typeof tabs[number]) => {
      navigate(
        tab === "Info"
          ? relative(JettonRoute.index)
          : relative(JettonRoute.activities),
        {
          replace: true,
        }
      );
    },
    [navigate]
  );

  const active = location.pathname.includes(JettonRoute.activities)
    ? tabs[1]
    : tabs[0];

  return (
    <Scroll>
      <HomeButton />
      <JettonBalance />
      <Tabs options={tabs} active={active} onChange={onChange} />
      <Routes>
        <Route path={JettonRoute.activities} element={<JettonActivities />} />
        <Route path="*" element={<JettonInfo />} />
      </Routes>
    </Scroll>
  );
};
