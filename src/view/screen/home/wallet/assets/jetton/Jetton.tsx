import { useContext, useMemo } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { WalletStateContext } from "../../../../../context";
import { JettonMinterAddressContext, JettonStateContext } from "./context";
import { JettonHide } from "./JettonHide";
import { JettonHome } from "./JettonHome";
import { JettonRoute } from "./route";
import { JettonSend } from "./send/SendJetton";

export const JettonRouter = () => {
  const wallet = useContext(WalletStateContext);
  const params = useParams();

  const minterAddress = useMemo(() => {
    return decodeURIComponent(params.minterAddress!);
  }, [params]);

  const jetton = useMemo(() => {
    return wallet.assets?.find(
      (asset) => asset.minterAddress === minterAddress
    )!;
  }, [wallet]);

  return (
    <JettonStateContext.Provider value={jetton}>
      <JettonMinterAddressContext.Provider value={minterAddress}>
        <Routes>
          <Route path={JettonRoute.send} element={<JettonSend />} />
          <Route path={JettonRoute.receive} element={<div>Receive</div>} />
          <Route path={JettonRoute.hide} element={<JettonHide />} />
          <Route path="*" element={<JettonHome />} />
        </Routes>
      </JettonMinterAddressContext.Provider>
    </JettonStateContext.Provider>
  );
};
