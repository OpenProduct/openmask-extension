import { useCallback, useEffect, useState } from "react";
import { NotificationData } from "../../../libs/event";
import { delay } from "../../../libs/state/accountService";
import { askBackground, sendBackground } from "../../event";
import { Loading } from "../Loading";
import { ImportJetton } from "./asset/ImportJetton";
import { ImportNft } from "./asset/ImportNft";
import { ConnectDApp } from "./connect/ConnectDApp";
import { DeployContract } from "./deploy/DeployContract";
import { SendTransaction } from "./send/SendTransaction";
import { SignPersonal } from "./sign/PersonalSign";
import { SignRaw } from "./sign/SignRaw";
import { SwitchNetwork } from "./switch/SwitchNetwork";
import { ConnectRequest } from "./tonConnect/Connect";
import { ConnectSendTransaction } from "./tonConnect/SendTransaction";

export const Notifications = () => {
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
    case "rawSign":
      return <SignRaw {...data} onClose={reloadNotification} />;
    case "personalSign":
      return <SignPersonal {...data} onClose={reloadNotification} />;
    case "switchNetwork":
      return <SwitchNetwork {...data} onClose={reloadNotification} />;
    case "importJetton":
      return <ImportJetton {...data} onClose={reloadNotification} />;
    case "importNft":
      return <ImportNft {...data} onClose={reloadNotification} />;
    case "connectDApp":
      return <ConnectDApp {...data} onClose={reloadNotification} />;
    case "sendTransaction":
      return <SendTransaction {...data} onClose={reloadNotification} />;
    case "tonConnectRequest":
      return <ConnectRequest {...data} onClose={reloadNotification} />;
    case "tonConnectSend":
      return <ConnectSendTransaction {...data} onClose={reloadNotification} />;
    default:
      return <Loading />;
  }
};

export default Notifications;
