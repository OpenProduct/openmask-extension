import { FC, useContext, useMemo } from "react";
import { useParams } from "react-router-dom";
import styled from "styled-components";
import { WalletState } from "../../../../libs/entries/wallet";
import {
  ActivitiesList,
  ActivityMessage,
} from "../../../components/ActivitiesList";
import { Body, Container, Icon, Scroll } from "../../../components/Components";
import { ConnectBadge } from "../../../components/ConnectBadge";
import {
  DropDown,
  DropDownListPayload,
  ListItem,
} from "../../../components/DropDown";
import { HomeButton } from "../../../components/HomeButton";
import { DeleteIcon } from "../../../components/Icons";
import { WalletStateContext } from "../../../context";
import { ListTitle } from "../../connections/Connections";
import { EmptyWalletName, WalletName } from "../../home/wallet/WalletName";
import { AssetTabs } from "../Token";
import { useJettonTransactions } from "./api";
import { JettonMinterAddressContext, JettonStateContext } from "./context";
import { JettonBalance } from "./JettonBalance";
import { JettonMenu } from "./JettonMenu";

const Block = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.lightGray};
  position: relative;
  padding: 5px ${(props) => props.theme.padding};
`;

const SecondBlock = styled(Container)`
  display: flex;
  width: 100%;
  align-items: center;
  background: ${(props) => props.theme.lightGray};
  padding: 5px ${(props) => props.theme.padding};
  justify-content: space-between;
`;

const JettonHead: FC<{
  wallet: WalletState;
}> = ({ wallet }) => {
  return (
    <Block>
      <ConnectBadge />
      <WalletName address={wallet.address} name={wallet.name} />
      <JettonMenu />
    </Block>
  );
};

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
export const JettonView = () => {
  const wallet = useContext(WalletStateContext);
  const params = useParams();

  const minterAddress = useMemo(() => {
    return decodeURIComponent(params.minterAddress!);
  }, [params]);

  const jetton = useMemo(() => {
    return wallet.assets?.find(
      (asset) => asset.minterAddress === minterAddress
    )!;
  }, [wallet]);

  const onDelete = () => {};

  const isLoading = false;

  return (
    <JettonStateContext.Provider value={jetton}>
      <JettonMinterAddressContext.Provider value={minterAddress}>
        <Scroll>
          <JettonHead wallet={wallet} />
          <HomeButton />
          <JettonBalance />
          <SecondBlock>
            <WalletName address={minterAddress} name="Jetton Minter" />
            {jetton.walletAddress ? (
              <WalletName address={jetton.walletAddress} name="Jetton Wallet" />
            ) : (
              <EmptyWalletName name="Jetton Wallet" />
            )}
            <DropDown
              payload={() => (
                <DropDownListPayload>
                  <ListTitle>Are you sure you want to hide jetton?</ListTitle>
                  <ListItem onClick={onDelete}>
                    {isLoading ? "Hiding..." : "Hide"}
                  </ListItem>
                </DropDownListPayload>
              )}
            >
              <Icon>
                <DeleteIcon />
              </Icon>
            </DropDown>
          </SecondBlock>
          <JettonActivities />
        </Scroll>
      </JettonMinterAddressContext.Provider>
    </JettonStateContext.Provider>
  );
};

export const ImportJetton = () => {
  return (
    <>
      <HomeButton />
      <AssetTabs />
      <Body>Import Jetton</Body>
    </>
  );
};
