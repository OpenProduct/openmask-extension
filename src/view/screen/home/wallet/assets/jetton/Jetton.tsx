import { useContext, useMemo } from "react";
import { Route, Routes, useParams } from "react-router-dom";
import { WalletStateContext } from "../../../../../context";
import { JettonMinterAddressContext, JettonStateContext } from "./context";
import { JettonHome } from "./JettonHome";
import { JettonRoute } from "./route";

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
          <Route path={JettonRoute.send} element={<div>Send</div>} />
          <Route path={JettonRoute.receive} element={<div>Receive</div>} />
          <Route path={JettonRoute.delete} element={<div>Delete</div>} />
          <Route path="*" element={<JettonHome />} />
        </Routes>
      </JettonMinterAddressContext.Provider>
    </JettonStateContext.Provider>
  );
};
