import { Address, NftData } from "@openmask/web-sdk";
import React, { FC, useContext, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
import { WalletStateContext } from "../../../../../context";
import { useNftDataMutation } from "./api";
import { AssetsTabs } from "./Tabs";

const NftPayload: FC<{ data: NftData }> = React.memo(({ data }) => {
  console.log(data);

  return <div>{data.contentUri}</div>;
});

export const ImportNft = () => {
  const navigate = useNavigate();

  const wallet = useContext(WalletStateContext);

  const [nftState, setNftState] = useState<NftData | null>(null);

  const [address, setAddress] = useState("");

  const {
    mutateAsync: nftDataAsync,
    reset,
    error: nftDataError,
    isLoading,
  } = useNftDataMutation();

  const isOwnNft = useMemo(() => {
    if (!nftState) return false;

    return (
      new Address(wallet.address).toString(false, false, false) ===
      nftState.ownerAddress?.toString(false, false, false)
    );
  }, [wallet, nftState]);

  const onSearch = async () => {
    reset();

    const data = await nftDataAsync(address);
    setNftState(data);
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
    if (nftState == null) {
      return <ButtonPositive onClick={onSearch}>Search</ButtonPositive>;
    }

    return (
      <ButtonPositive disabled={!isOwnNft} onClick={onAdd}>
        Add NFT
      </ButtonPositive>
    );
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
          disabled={nftState != null}
        />

        {nftDataError && <ErrorMessage>{nftDataError.message}</ErrorMessage>}
        {nftState && <NftPayload data={nftState} />}

        <Gap />
        <ButtonColumn>
          <Button />
        </ButtonColumn>
      </Body>
    </>
  );
};
