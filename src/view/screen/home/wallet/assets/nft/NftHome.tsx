import { useCallback, useContext } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import { ActivitiesList } from "../../../../../components/ActivitiesList";
import { AddressBlock } from "../../../../../components/AddressBlock";
import {
  BallanceBlock,
  BallanceButton,
  BallanceButtonRow,
} from "../../../../../components/BalanceButton";
import {
  Body,
  ButtonColumn,
  ButtonNegative,
  Scroll,
} from "../../../../../components/Components";
import { HomeButton } from "../../../../../components/HomeButton";
import {
  DeleteIcon,
  ReceiveIcon,
  SendIcon,
} from "../../../../../components/Icons";
import { NftPayload } from "../../../../../components/NftPayload";
import { Tabs } from "../../../../../components/Tabs";
import { relative } from "../../../../../routes";
import { useNFtTransactions } from "./api";
import { NftItemStateContext, NftStateContext } from "./context";
import { NftItemRoute } from "./router";

const NftActivities = () => {
  const state = useContext(NftItemStateContext);
  const { data, isLoading } = useNFtTransactions(state);
  return (
    <ActivitiesList data={data} isLoading={isLoading} address={state.address} />
  );
};

const NftHeader = () => {
  const navigate = useNavigate();
  const nft = useContext(NftItemStateContext);
  return (
    <BallanceBlock>
      <NftPayload state={nft.state} />
      <BallanceButtonRow>
        <BallanceButton
          label="Receive"
          onClick={() => navigate(relative(NftItemRoute.receive))}
        >
          <ReceiveIcon />
        </BallanceButton>
        <BallanceButton
          label="Transfer"
          onClick={() => navigate(relative(NftItemRoute.send))}
        >
          <SendIcon />
        </BallanceButton>
      </BallanceButtonRow>
    </BallanceBlock>
  );
};

const NftInfo = () => {
  const navigate = useNavigate();
  const collection = useContext(NftStateContext);
  const nft = useContext(NftItemStateContext);

  return (
    <Body>
      <AddressBlock
        label="NFT Collection"
        address={collection.collectionAddress}
      />
      <AddressBlock label="NFT Contract" address={nft.address} />
      <ButtonColumn>
        <ButtonNegative onClick={() => navigate(`..${NftItemRoute.hide}`)}>
          Hide <DeleteIcon />
        </ButtonNegative>
      </ButtonColumn>
    </Body>
  );
};

const tabs = ["Activity", "Info"];

export const NftHome = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const onChange = useCallback(
    (tab: typeof tabs[number]) => {
      navigate(
        tab === "Info"
          ? relative(NftItemRoute.info)
          : relative(NftItemRoute.index),
        {
          replace: true,
        }
      );
    },
    [navigate]
  );

  const active = location.pathname.includes(NftItemRoute.info)
    ? tabs[1]
    : tabs[0];

  return (
    <Scroll>
      <HomeButton />
      <NftHeader />
      <Tabs options={tabs} active={active} onChange={onChange} />
      <Routes>
        <Route path={NftItemRoute.info} element={<NftInfo />} />
        <Route path="*" element={<NftActivities />} />
      </Routes>
    </Scroll>
  );
};
