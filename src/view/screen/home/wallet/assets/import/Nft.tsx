import { Address, NftData } from "@openproduct/web-sdk";
import { useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  NftCollectionState,
  NftItemState,
} from "../../../../../../libs/entries/asset";
import {
  Body,
  ButtonColumn,
  ButtonPositive,
  ErrorMessage,
  Gap,
} from "../../../../../components/Components";
import { Dots } from "../../../../../components/Dots";
import { HomeButton } from "../../../../../components/HomeButton";
import { InputField } from "../../../../../components/InputField";
import { NftPayload } from "../../../../../components/NftPayload";
import { NetworkContext, WalletStateContext } from "../../../../../context";
import { AppRoute } from "../../../../../routes";
import {
  useAddNftMutation,
  useDomainNftMutation,
  useNftCollectionDataMutation,
  useNftContentMutation,
  useNftDataMutation,
} from "./api";
import { AssetsTabs } from "./Tabs";

const Block = styled.div`
  padding-top: ${(props) => props.theme.padding};
`;

export const ImportNft = () => {
  const navigate = useNavigate();

  const network = useContext(NetworkContext);
  const wallet = useContext(WalletStateContext);

  const [nftData, setNftData] = useState<NftData | null>(null);
  const [nftState, setNftState] = useState<NftItemState | null>(null);
  const [nftCollectionState, setNftCollectionState] =
    useState<NftCollectionState | null>(null);

  const [address, setAddress] = useState("");

  const {
    mutateAsync: nftDataAsync,
    reset,
    error: nftDataError,
    isLoading: isDataLoading,
  } = useNftDataMutation();

  const {
    mutateAsync: nftStateAsync,
    error: nftStateError,
    isLoading: isStateLoading,
  } = useNftContentMutation();

  const {
    mutateAsync: nftCollectionStateAsync,
    isLoading: isCollectionLoading,
  } = useNftCollectionDataMutation();

  const {
    mutateAsync: domainNftStateAsync,
    error: domainNftError,
    isLoading: isDomainLoading,
  } = useDomainNftMutation();

  const {
    mutateAsync: addNftAsync,
    error: addNftError,
    reset: resetAdd,
    isLoading: isAddLoading,
  } = useAddNftMutation();

  const isLoading =
    isDataLoading || isStateLoading || isCollectionLoading || isDomainLoading;

  const isOwnNft = useMemo(() => {
    if (!nftData) return false;

    const walletAddress = new Address(wallet.address).toString(
      true,
      true,
      true,
      network === "testnet"
    );
    const nftOwner = nftData.ownerAddress?.toString(
      true,
      true,
      true,
      network === "testnet"
    );
    return walletAddress == nftOwner;
  }, [wallet, nftData]);

  const onSearch = async () => {
    reset();

    const data = await nftDataAsync(address);
    setNftData(data);

    if (data.collectionAddress) {
      const collection = await nftCollectionStateAsync(data.collectionAddress);
      setNftCollectionState(collection);

      const state = await domainNftStateAsync({ collection, address });
      if (state) setNftState(state);
    }

    const nftItemState = await nftStateAsync(data).catch(() => null);
    if (nftItemState) setNftState(nftItemState);
  };

  const onAdd = async () => {
    resetAdd();

    if (!isOwnNft || !nftData) {
      return;
    }

    await addNftAsync({
      nftAddress: address,
      nftData,
      state: nftState,
      collection: nftCollectionState,
    });

    navigate(AppRoute.home);
  };

  const Button = () => {
    if (isLoading || isAddLoading) {
      return (
        <ButtonPositive disabled={true}>
          <Dots>Loading</Dots>
        </ButtonPositive>
      );
    }
    if (nftData == null) {
      return <ButtonPositive onClick={onSearch}>Search</ButtonPositive>;
    }

    if (!isOwnNft) {
      return <ButtonPositive disabled={true}>Another's NFT</ButtonPositive>;
    }

    return <ButtonPositive onClick={onAdd}>Add NFT</ButtonPositive>;
  };

  return (
    <>
      <HomeButton />
      <AssetsTabs />
      <Body>
        <InputField
          label="NFT Contract address"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          onBlur={onSearch}
          disabled={nftData != null}
        />

        {nftData && !isLoading && (
          <Block>
            <NftPayload state={nftState} />
          </Block>
        )}

        {nftDataError && <ErrorMessage>{nftDataError.message}</ErrorMessage>}
        {nftStateError && <ErrorMessage>{nftStateError.message}</ErrorMessage>}
        {addNftError && <ErrorMessage>{addNftError.message}</ErrorMessage>}
        {domainNftError && (
          <ErrorMessage>{domainNftError.message}</ErrorMessage>
        )}

        <Gap />
        <ButtonColumn>
          <Button />
        </ButtonColumn>
      </Body>
    </>
  );
};
