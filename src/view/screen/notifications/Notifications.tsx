import { Route, Routes } from "react-router-dom";
import { Loading } from "../Loading";
import { ImportJetton } from "./asset/ImportJetton";
import { ImportNft } from "./asset/ImportNft";
import { ConnectDApp } from "./connect/ConnectDApp";
import { NotificationsRoutes } from "./route";
import { SignPersonal } from "./sign/PersonalSign";
import { SignRaw } from "./sign/SignRaw";
import { SwitchNetwork } from "./switch/SwitchNetwork";

export const NotificationsRouter = () => {
  return (
    <Routes>
      <Route path={NotificationsRoutes.network} element={<SwitchNetwork />} />
      <Route path={NotificationsRoutes.dapp} element={<ConnectDApp />} />
      <Route path={NotificationsRoutes.jetton} element={<ImportJetton />} />
      <Route path={NotificationsRoutes.nft} element={<ImportNft />} />
      <Route path={NotificationsRoutes.unlock} element={<Loading />} />
      <Route path={NotificationsRoutes.raw} element={<SignRaw />} />
      <Route path={NotificationsRoutes.personal} element={<SignPersonal />} />
    </Routes>
  );
};
