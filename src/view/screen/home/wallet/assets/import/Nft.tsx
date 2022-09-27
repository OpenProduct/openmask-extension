import { Address, NftData } from "@openmask/web-sdk";
import React, { FC, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { NftState } from "../../../../../../libs/entries/asset";
import {
  Body,
  ButtonColumn,
  ButtonPositive,
  ErrorMessage,
  Gap,
  Text,
} from "../../../../../components/Components";
import { Dots } from "../../../../../components/Dots";
import { HomeButton } from "../../../../../components/HomeButton";
import { InputField } from "../../../../../components/InputField";
import { WalletStateContext } from "../../../../../context";
import { useNftContentMutation, useNftDataMutation } from "./api";
import { AssetsTabs } from "./Tabs";

const Block = styled.div`
  padding: ${(props) => props.theme.padding} 0;
`;

const ImageWrapper = styled.div`
  padding: ${(props) => props.theme.padding};
  margin-bottom: ${(props) => props.theme.padding};
  border: 1px solid ${(props) => props.theme.darkGray};
  border-radius: 20px;
  text-align: center;
`;

const NftImage = styled.img`
  max-height: 200px;
  max-width: 100%;
`;

const NftPayload: FC<{ data: NftData; state: NftState | null }> = React.memo(
  ({ data, state }) => {
    if (!state) {
      return (
        <Block>
          <Text>Missing NFT content</Text>
        </Block>
      );
    }

    return (
      <Block>
        {state.name && <Text>{state.name}</Text>}
        <ImageWrapper>
          <NftImage src={state.image} />
        </ImageWrapper>
        {state.description && <Text>{state.description}</Text>}
      </Block>
    );
  }
);

export const ImportNft = () => {
  const navigate = useNavigate();

  const wallet = useContext(WalletStateContext);

  const [nftData, setNftData] = useState<NftData | null>(null);
  const [nftState, setNftState] = useState<NftState | null>(null);

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

  const isLoading = isDataLoading || isStateLoading;

  const isOwnNft = useMemo(() => {
    if (!nftData) return false;

    const walletAddress = new Address(wallet.address).toString(
      true,
      true,
      true
    );
    const nftOwner = nftData.ownerAddress?.toString(true, true, true);
    return walletAddress == nftOwner;
  }, [wallet, nftData]);

  const onSearch = async () => {
    reset();

    const data = await nftDataAsync(address);
    setNftData(data);

    if (data.contentUri) {
      const state = await nftStateAsync(data.contentUri);
      setNftState(state);
    }
  };

  const onAdd = () => {};

  const Button = () => {
    if (isLoading) {
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
      return (
        <ButtonPositive disabled={true}>Another's wallet NFT</ButtonPositive>
      );
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

        {nftDataError && <ErrorMessage>{nftDataError.message}</ErrorMessage>}
        {nftStateError && <ErrorMessage>{nftStateError.message}</ErrorMessage>}

        {nftData && !isLoading && (
          <NftPayload data={nftData} state={nftState} />
        )}

        <Gap />
        <ButtonColumn>
          <Button />
        </ButtonColumn>
      </Body>
    </>
  );
};
