import { FC, useCallback, useContext, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { NftItem } from "../../../../../../../libs/entries/asset";
import {
  Body,
  ButtonBottomRow,
  ButtonPositive,
  Gap,
  H1,
} from "../../../../../../components/Components";
import { InputField } from "../../../../../../components/InputField";
import { SendCancelButton } from "../../../../../../components/send/SendButtons";
import { SendLoadingView } from "../../../../../../components/send/SendLoadingView";
import { SendSuccessView } from "../../../../../../components/send/SendSuccessView";
import { WalletAddressContext } from "../../../../../../context";
import { sendBackground } from "../../../../../../event";
import { NftItemStateContext, NftStateContext } from "../context";
import { SendNftState, stateToSearch, toSendNftState } from "./api";

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

      <Gap />
      <ButtonBottomRow>
        <SendCancelButton homeRoute="../" />
        <ButtonPositive onClick={onSend}>Next</ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};

export const NftSend = () => {
  const address = useContext(WalletAddressContext);
  const collection = useContext(NftStateContext);
  const nft = useContext(NftItemStateContext);
  const [searchParams, setSearchParams] = useSearchParams();

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

      sendBackground.message("storeOperation", {
        kind: "sendNft",
        value: {
          collectionAddress: collection.collectionAddress,
          address: nft.address,
          params,
        },
      });

      setSearchParams(params);
    },
    [setSearchParams]
  );

  const onConfirm = useCallback(() => {
    sendBackground.message("storeOperation", null);

    setSearchParams({ confirm: String(seqNo) });
  }, [setSearchParams, seqNo]);

  if (confirm !== null) {
    return <SendSuccessView address={address} />;
  }

  if (seqNo !== null) {
    return (
      <SendLoadingView address={address} seqNo={seqNo} onConfirm={onConfirm} />
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

  return <div></div>;
};
