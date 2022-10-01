import { Address, NftData } from "@openmask/web-sdk";
import { useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  NftCollectionState,
  NftItemState,
} from "../../../../libs/entries/asset";
import {
  Body,
  ButtonBottomRow,
  ButtonNegative,
  ButtonPositive,
  Center,
  ErrorMessage,
  Gap,
  H1,
  Text,
} from "../../../components/Components";
import { DAppBadge } from "../../../components/DAppBadge";
import { NftPayload } from "../../../components/NftPayload";
import { WalletStateContext } from "../../../context";
import { sendBackground } from "../../../event";
import {
  useAddNftMutation,
  useNftCollectionDataMutation,
  useNftContentMutation,
  useNftDataMutation,
} from "../../home/wallet/assets/import/api";
import { Loading, NotificationView } from "../../Loading";

export const ImportNft = () => {
  const [searchParams] = useSearchParams();

  const wallet = useContext(WalletStateContext);

  const origin = decodeURIComponent(searchParams.get("origin") ?? "");
  const logo = decodeURIComponent(searchParams.get("logo") ?? "");
  const address = decodeURIComponent(searchParams.get("address") ?? "");

  const id = parseInt(searchParams.get("id") ?? "0", 10);

  const [nftData, setNftData] = useState<NftData | null>(null);
  const [nftState, setNftState] = useState<NftItemState | null>(null);
  const [nftCollectionState, setNftCollectionState] =
    useState<NftCollectionState | null>(null);

  const { mutateAsync: nftDataAsync, isLoading: isDataLoading } =
    useNftDataMutation();

  const { mutateAsync: nftStateAsync, isLoading: isStateLoading } =
    useNftContentMutation();

  const {
    mutateAsync: nftCollectionStateAsync,
    isLoading: isCollectionLoading,
  } = useNftCollectionDataMutation();

  const {
    mutateAsync: addNftAsync,
    reset: resetAdd,
    error: addNftError,
    isLoading: isAddLoading,
  } = useAddNftMutation();

  useEffect(() => {
    (async () => {
      const data = await nftDataAsync(address);
      setNftData(data);

      if (data.contentUri) {
        const state = await nftStateAsync(data.contentUri);
        setNftState(state);
      }
      if (data.collectionAddress) {
        const collection = await nftCollectionStateAsync(
          data.collectionAddress
        );
        setNftCollectionState(collection);
      }
    })();
  }, []);

  const isLoading = isDataLoading || isStateLoading || isCollectionLoading;

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

    sendBackground.message("approveRequest", { id, payload: undefined });
  };

  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
  }, [id]);

  useEffect(() => {
    if (!address) {
      onBack();
    }
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  if (nftData == null) {
    return (
      <NotificationView button="Close" action={onBack}>
        <ErrorMessage>NFT Data is not define</ErrorMessage>
      </NotificationView>
    );
  }

  return (
    <Body>
      <Center>
        <DAppBadge logo={logo} origin={origin} />
        <H1>Add Suggested NFT</H1>
        <Text>Would you like to import these NFT?</Text>
      </Center>

      <NftPayload state={nftState} />

      <Gap />
      <ButtonBottomRow>
        <ButtonNegative onClick={onBack} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive
          onClick={onAdd}
          disabled={isLoading || isAddLoading || !isOwnNft}
        >
          {isOwnNft ? "Another's NFT" : "Add NFT"}
        </ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};
