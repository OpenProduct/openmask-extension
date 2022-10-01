import { Route, Routes } from "react-router-dom";
import { ImportJetton } from "./import/Jetton";
import { ImportNft } from "./import/Nft";
import { JettonRouter } from "./jetton/Jetton";
import { NftRouter } from "./nft/Nft";
import { AssetRoutes } from "./route";

export const AssetsRouter = () => {
  return (
    <Routes>
      <Route path={AssetRoutes.jettons}>
        <Route index element={<ImportJetton />} />
        <Route path=":minterAddress/*" element={<JettonRouter />} />
      </Route>
      <Route path={AssetRoutes.nfts}>
        <Route index element={<ImportNft />} />
        <Route path=":collectionAddress/*" element={<NftRouter />} />
      </Route>
    </Routes>
  );
};
