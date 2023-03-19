import { FC, useContext, useMemo } from "react";
import { Route, Routes, useNavigate, useParams } from "react-router-dom";
import { JettonAsset } from "../../../../../../libs/entries/asset";
import { getWalletAssets } from "../../../../../../libs/entries/wallet";
import { seeIfJettonAsset } from "../../../../../../libs/state/assetService";
import { Body } from "../../../../../components/Components";
import { HomeButton } from "../../../../../components/HomeButton";
import { WalletStateContext } from "../../../../../context";
import { AppRoute } from "../../../../../routes";
import { ReceiveCoin } from "../../receive/Receive";
import { JettonMinterAddressContext, JettonStateContext } from "./context";
import { JettonHide } from "./JettonHide";
import { JettonHome } from "./JettonHome";
import { JettonRoute } from "./route";
import { JettonSend } from "./send/SendJetton";

const ReceiveJetton: FC<{ symbol: string }> = ({ symbol }) => {
  return (
    <>
      <HomeButton path="../" text="Back" />
      <Body>
        <ReceiveCoin symbol={symbol} />
      </Body>
    </>
  );
};

export const JettonRouter = () => {
  const navigate = useNavigate();
  const wallet = useContext(WalletStateContext);
  const params = useParams();

  const minterAddress = useMemo(() => {
    return decodeURIComponent(params.minterAddress!);
  }, [params]);

  const jetton = useMemo(() => {
    const asset = getWalletAssets(wallet).find(
      (asset) =>
        seeIfJettonAsset(asset) && asset.minterAddress === minterAddress
    );
    if (!asset) {
      navigate(AppRoute.home);
    }
    return asset as JettonAsset;
  }, [wallet]);

  if (!jetton) return <></>;

  return (
    <JettonStateContext.Provider value={jetton}>
      <JettonMinterAddressContext.Provider value={minterAddress}>
        <Routes>
          <Route path={JettonRoute.send} element={<JettonSend />} />
          <Route
            path={JettonRoute.receive}
            element={<ReceiveJetton symbol={jetton.state.symbol} />}
          />
          <Route path={JettonRoute.hide} element={<JettonHide />} />
          <Route path="*" element={<JettonHome />} />
        </Routes>
      </JettonMinterAddressContext.Provider>
    </JettonStateContext.Provider>
  );
};
