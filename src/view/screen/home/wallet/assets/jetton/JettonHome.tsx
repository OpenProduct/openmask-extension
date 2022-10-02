import { useCallback, useContext } from "react";
import { Route, Routes, useLocation, useNavigate } from "react-router-dom";
import {
  ActivitiesList,
  ActivityMessage,
} from "../../../../../components/ActivitiesList";
import { AddressBlock } from "../../../../../components/AddressBlock";
import {
  Body,
  ButtonColumn,
  ButtonNegative,
  Scroll,
} from "../../../../../components/Components";
import { HomeButton } from "../../../../../components/HomeButton";
import { DeleteIcon } from "../../../../../components/Icons";
import { Tabs } from "../../../../../components/Tabs";
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

const JettonInfo = () => {
  const navigate = useNavigate();
  const jetton = useContext(JettonStateContext);
  const minterAddress = useContext(JettonMinterAddressContext);

  return (
    <Body>
      <AddressBlock label="Jetton Minter" address={minterAddress} />
      <AddressBlock label="Jetton Wallet" address={jetton.walletAddress} />
      <ButtonColumn>
        <ButtonNegative onClick={() => navigate(`..${JettonRoute.hide}`)}>
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
