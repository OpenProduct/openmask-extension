import { useCallback, useEffect, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { NotificationData } from "../../../libs/event";
import { askBackground, sendBackground } from "../../event";
import { Loading } from "../Loading";
import { ImportJetton } from "./asset/ImportJetton";
import { ImportNft } from "./asset/ImportNft";
import { ConnectDApp } from "./connect/ConnectDApp";
import { DeployContract } from "./deploy/DeployContract";
import { NotificationsRoutes } from "./route";
import { SignPersonal } from "./sign/PersonalSign";
import { SignRaw } from "./sign/SignRaw";
import { SwitchNetwork } from "./switch/SwitchNetwork";

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const NotificationsIndex = () => {
  const [data, setData] = useState<NotificationData | undefined>(undefined);

  const reloadNotification = useCallback(async (wait = true) => {
    setData(undefined);
    if (wait) {
      await delay(200);
    }
    try {
      const item = await askBackground<NotificationData | undefined>().message(
        "getNotification"
      );
      if (item) {
        setData(item);
      } else {
        sendBackground.message("closePopUp");
      }
    } catch (e) {
      sendBackground.message("closePopUp");
    }
  }, []);

  useEffect(() => {
    reloadNotification(false);
  }, []);

  if (!data) {
    return <Loading />;
  }

  switch (data.kind) {
    case "deploy":
      return <DeployContract {...data} onClose={reloadNotification} />;
    default:
      return <Loading />;
  }
};

export const NotificationsRouter = () => {
  return (
    <Routes>
      <Route index element={<NotificationsIndex />} />
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
