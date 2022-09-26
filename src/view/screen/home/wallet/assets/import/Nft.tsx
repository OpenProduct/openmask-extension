import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { NftState } from "../../../../../../libs/entries/asset";
import {
  Body,
  ButtonColumn,
  ButtonPositive,
  Gap,
} from "../../../../../components/Components";
import { Dots } from "../../../../../components/Dots";
import { HomeButton } from "../../../../../components/HomeButton";
import { InputField } from "../../../../../components/InputField";
import { AssetsTabs } from "./Tabs";

export const ImportNft = () => {
  const navigate = useNavigate();

  const [nftState, setNftState] = useState<NftState | null>(null);

  const [address, setAddress] = useState("");

  const onSearch = () => {};

  const onAdd = () => {};
  const isLoading = true;
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
        />

        <Gap />
        <ButtonColumn>
          <Button />
        </ButtonColumn>
      </Body>
    </>
  );
};
