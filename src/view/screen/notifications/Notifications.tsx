import { Route, Routes } from "react-router-dom";
import { Loading } from "../Loading";
import { ImportJetton } from "./asset/ImportJetton";
import { ConnectDApp } from "./connect/ConnectDApp";
import { SwitchNetwork } from "./switch/SwitchNetwork";

enum NotificationsRoutes {
  network = "/network",
  dapp = "/dapp",
  unlock = "/unlock",
  jetton = "/jetton",
}

export const NotificationsRouter = () => {
  return (
    <Routes>
      <Route path={NotificationsRoutes.network} element={<SwitchNetwork />} />
      <Route path={NotificationsRoutes.dapp} element={<ConnectDApp />} />
      <Route path={NotificationsRoutes.jetton} element={<ImportJetton />} />
      <Route path={NotificationsRoutes.unlock} element={<Loading />} />
    </Routes>
  );
};
