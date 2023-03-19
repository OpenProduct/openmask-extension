import { FC, useContext, useMemo } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { NftAsset } from "../../../../../../libs/entries/asset";
import { getWalletAssets } from "../../../../../../libs/entries/wallet";
import { seeIfJettonAsset } from "../../../../../../libs/state/assetService";
import { Body } from "../../../../../components/Components";
import { HomeButton } from "../../../../../components/HomeButton";
import { WalletStateContext } from "../../../../../context";
import { AppRoute } from "../../../../../routes";
import { ReceiveCoin } from "../../receive/Receive";
import { NftItemStateContext, NftStateContext } from "./context";
import { NftHide } from "./NftHide";
import { NftHome } from "./NftHome";
import { NftList } from "./NftList";
import { NftItemRoute } from "./router";
import { NftSend } from "./send/SendNft";

const ReceiveNft = () => {
  return (
    <>
      <HomeButton path="../" text="Back" />
      <Body>
        <ReceiveCoin symbol="NFT" />
      </Body>
    </>
  );
};

const NftItemRouter: FC<{ asset: NftAsset }> = ({ asset }) => {
  const navigate = useNavigate();
  const params = useParams();

  const itemAddress = useMemo(() => {
    return decodeURIComponent(params.address!);
  }, [params]);

  const item = useMemo(() => {
    const item = asset.items.find((item) => item.address === itemAddress);

    if (!item) {
      navigate(AppRoute.home);
    }

    return item;
  }, [asset]);
  if (!item) return <></>;

  return (
    <NftStateContext.Provider value={asset}>
      <NftItemStateContext.Provider value={item}>
        <Routes>
          <Route path={NftItemRoute.send} element={<NftSend />} />
          <Route path={NftItemRoute.receive} element={<ReceiveNft />} />
          <Route path={NftItemRoute.hide} element={<NftHide />} />
          <Route path="*" element={<NftHome />} />
        </Routes>
      </NftItemStateContext.Provider>
    </NftStateContext.Provider>
  );
};

export const NftRouter = () => {
  const navigate = useNavigate();
  const wallet = useContext(WalletStateContext);
  const params = useParams();

  const collectionAddress = useMemo(() => {
    return decodeURIComponent(params.collectionAddress!);
  }, [params]);

  const asset = useMemo(() => {
    const asset = getWalletAssets(wallet).find(
      (asset) =>
        !seeIfJettonAsset(asset) &&
        asset.collectionAddress === collectionAddress
    );
    if (!asset) {
      navigate(AppRoute.home);
    }
    return asset as NftAsset;
  }, [wallet]);

  if (!asset) return <></>;

  return (
    <Routes>
      <Route index element={<NftList asset={asset} />} />
      <Route path=":address/*" element={<NftItemRouter asset={asset} />} />
    </Routes>
  );
};
