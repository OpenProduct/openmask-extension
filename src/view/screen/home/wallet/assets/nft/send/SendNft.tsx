import { FC, useCallback, useContext, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { NftItem } from "../../../../../../../libs/entries/asset";
import ExtensionPlatform from "../../../../../../../libs/service/extension";
import { SendNftState } from "../../../../../../../libs/service/transfer/nftService";
import {
  Body,
  ButtonBottomRow,
  ButtonColumn,
  ButtonNegative,
  ButtonPositive,
  Center,
  ErrorMessage,
  Gap,
  H1,
  Text,
} from "../../../../../../components/Components";
import { DeleteIcon, LinkIcon } from "../../../../../../components/Icons";
import { InputField } from "../../../../../../components/InputField";
import { LoadingLogo } from "../../../../../../components/Logo";
import { SendCancelButton } from "../../../../../../components/send/SendButtons";
import { SendLoadingView } from "../../../../../../components/send/SendLoadingView";
import { WalletStateContext } from "../../../../../../context";
import { sendBackground } from "../../../../../../event";
import { AppRoute } from "../../../../../../routes";
import { useBalance, useSelectedNetworkConfig } from "../../../../api";
import { useHideNftMutation } from "../api";
import { NftItemStateContext, NftStateContext } from "../context";
import { stateToSearch, toSendNftState } from "./api";
import { SendNftConfirm } from "./SendNftConfirm";

interface SuccessProps {
  collectionAddress: string;
  address: string;
  walletAddress: string;
}

const SuccessView: FC<SuccessProps> = ({
  collectionAddress,
  address,
  walletAddress,
}) => {
  const navigate = useNavigate();
  const config = useSelectedNetworkConfig();

  const {
    mutateAsync: hideNftMutationAsync,
    reset,
    error,
  } = useHideNftMutation();

  const onHide = async () => {
    reset();

    await hideNftMutationAsync({ collectionAddress, address });

    navigate(AppRoute.home);
  };

  return (
    <Body>
      <Gap />
      <LoadingLogo />
      <Center>
        <H1>Confirm</H1>
        <Text>Transaction finished</Text>
      </Center>
      <ButtonColumn>
        <ButtonNegative
          onClick={() => {
            ExtensionPlatform.openTab({
              url: `${config.scanUrl}${walletAddress}`,
            });
          }}
        >
          View in explorer <LinkIcon />
        </ButtonNegative>
        <ButtonPositive onClick={onHide}>
          Hide NFT <DeleteIcon />
        </ButtonPositive>
      </ButtonColumn>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      <Gap />
    </Body>
  );
};

interface InputProps {
  nft: NftItem;
  state: SendNftState;

  onChange: (field: Partial<SendNftState>) => void;
  onSend: () => void;
}

const SendNftInputView: FC<InputProps> = ({ nft, state, onChange, onSend }) => {
  return (
    <Body>
      <H1>Transfer {nft.state?.name ?? "Unknown"}</H1>

      <InputField
        label="Enter wallet address"
        value={state.address}
        onChange={(e) => onChange({ address: e.target.value })}
      />

      <InputField
        label="Transaction Amount"
        type="number"
        value={state.amount}
        onChange={(e) => onChange({ amount: e.target.value })}
      />

      <Gap />
      <ButtonBottomRow>
        <SendCancelButton homeRoute="../" />
        <ButtonPositive onClick={onSend}>Next</ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};

export const NftSend = () => {
  const wallet = useContext(WalletStateContext);
  const collection = useContext(NftStateContext);
  const nft = useContext(NftItemStateContext);
  const [searchParams, setSearchParams] = useSearchParams();

  const { data: balance } = useBalance(wallet.address);

  const seqNo = searchParams.get("seqNo");
  const confirm = searchParams.get("confirm");

  const submit = searchParams.get("submit") === "1";

  const state = useMemo(() => {
    return toSendNftState(searchParams);
  }, [searchParams]);

  const onSubmit = useCallback(() => {
    const params = { ...stateToSearch(state), submit: "1" };

    sendBackground.message("storeOperation", {
      kind: "sendNft",
      value: {
        wallet: wallet.address,
        collectionAddress: collection.collectionAddress,
        address: nft.address,
        params,
      },
    });

    setSearchParams(params);
  }, [setSearchParams, state]);

  const onChange = useCallback(
    (field: Partial<SendNftState>) => {
      const params = stateToSearch({ ...state, ...field });

      sendBackground.message("storeOperation", {
        kind: "sendNft",
        value: {
          wallet: wallet.address,
          collectionAddress: collection.collectionAddress,
          address: nft.address,
          params,
        },
      });

      setSearchParams(params);
    },
    [setSearchParams, state]
  );

  const onSend = useCallback(
    (seqNo: number) => {
      const params = { seqNo: String(seqNo) };

      sendBackground.message("storeOperation", null);

      setSearchParams(params);
    },
    [setSearchParams]
  );

  const onConfirm = useCallback(async () => {
    sendBackground.message("storeOperation", null);
    setSearchParams({ confirm: String(seqNo) });
  }, [setSearchParams, seqNo]);

  if (confirm !== null) {
    return (
      <SuccessView
        collectionAddress={collection.collectionAddress}
        address={nft.address}
        walletAddress={wallet.address}
      />
    );
  }

  if (seqNo !== null) {
    return (
      <SendLoadingView
        address={wallet.address}
        seqNo={seqNo}
        onConfirm={onConfirm}
      />
    );
  }

  if (!submit) {
    return (
      <SendNftInputView
        state={state}
        nft={nft}
        onChange={onChange}
        onSend={onSubmit}
      />
    );
  }

  return (
    <SendNftConfirm nft={nft} state={state} onSend={onSend} balance={balance} />
  );
};
