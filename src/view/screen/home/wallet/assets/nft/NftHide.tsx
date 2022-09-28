import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
  Gap,
  H1,
  Text,
} from "../../../../../components/Components";
import { AppRoute } from "../../../../../routes";
import { useHideNftMutation } from "./api";
import { NftItemStateContext } from "./context";

export const NftHide = () => {
  const nft = useContext(NftItemStateContext);
  const navigate = useNavigate();

  const { mutateAsync, isLoading } = useHideNftMutation();

  const onDelete = async () => {
    await mutateAsync(nft.address);
    navigate(AppRoute.home);
  };

  return (
    <Body>
      <H1>Hide NFT</H1>
      <Text>
        Hiding <b>{nft.state?.name ?? "Unknown"}</b> NFT will clear local stored
        data.
      </Text>
      <Text>The NFT could be re-enter by NFT Contract address.</Text>
      <Gap />
      <ButtonRow>
        <ButtonNegative onClick={() => navigate("../")} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onDelete} disabled={isLoading}>
          Hide
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
