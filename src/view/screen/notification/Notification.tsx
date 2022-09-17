import { Route, Routes } from "react-router-dom";
import { Loading } from "../Loading";
import { ImportJetton } from "./asset/ImportJetton";
import { ConnectDApp } from "./connect/ConnectDApp";
import { SwitchNetwork } from "./switch/SwitchNetwork";

enum NotificationRoutes {
  network = "/network",
  dapp = "/dapp",
  unlock = "/unlock",
  jetton = "/jetton",
}

export const Notification = () => {
  return (
    <Routes>
      <Route path={NotificationRoutes.network} element={<SwitchNetwork />} />
      <Route path={NotificationRoutes.dapp} element={<ConnectDApp />} />
      <Route path={NotificationRoutes.jetton} element={<ImportJetton />} />
      <Route path={NotificationRoutes.unlock} element={<Loading />} />
    </Routes>
  );
};
