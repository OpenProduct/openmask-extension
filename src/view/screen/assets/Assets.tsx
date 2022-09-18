import { Route, Routes } from "react-router-dom";
import { ImportJetton, JettonView } from "./jetton/Jetton";
import { ImportNFT } from "./Nft";
import { AssetRoutes } from "./Token";

export const AssetsRouter = () => {
  return (
    <Routes>
      <Route path={AssetRoutes.jettons}>
        <Route index element={<ImportJetton />} />
        <Route path=":minterAddress" element={<JettonView />} />
      </Route>
      <Route path={AssetRoutes.nfts}>
        <Route index element={<ImportNFT />} />
        <Route path=":collectionAddress" element={<div>NFT</div>} />
      </Route>
    </Routes>
  );
};
