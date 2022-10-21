import { Address, NftData } from "@openproduct/web-sdk";
import {
  FC,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  NftCollectionState,
  NftItemState,
  NftParams,
} from "../../../../libs/entries/asset";
import { NotificationFields } from "../../../../libs/event";
import {
  Body,
  ButtonNegative,
  ButtonPositive,
  ButtonRow,
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

export const ImportNft: FC<
  NotificationFields<"importNft", NftParams> & {
    onClose: () => void;
  }
> = ({ id, logo, origin, data: params, onClose }) => {
  const wallet = useContext(WalletStateContext);

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
      const data = await nftDataAsync(params.address);
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
      nftAddress: params.address,
      nftData,
      state: nftState,
      collection: nftCollectionState,
    });

    sendBackground.message("approveRequest", { id, payload: undefined });
    onClose();
  };

  const onBack = useCallback(() => {
    sendBackground.message("rejectRequest", id);
    onClose();
  }, [id]);

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
      <ButtonRow>
        <ButtonNegative onClick={onBack} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive
          onClick={onAdd}
          disabled={isLoading || isAddLoading || !isOwnNft}
        >
          {isOwnNft ? "Add NFT" : "Another's NFT"}
        </ButtonPositive>
      </ButtonRow>
    </Body>
  );
};
