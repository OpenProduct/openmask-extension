import { DeployParams } from "../../event";
import memoryStore from "../../store/memoryStore";
import { getActiveTabLogo, openNotificationPopUp } from "./notificationService";
import {
  checkBaseDAppPermission,
  switchActiveAddress,
  waitApprove,
} from "./utils";

export const deploySmartContract = async (
  id: number,
  origin: string,
  data: DeployParams,
  wallet?: string
) => {
  await checkBaseDAppPermission(origin, wallet);
  await switchActiveAddress(origin, wallet);

  memoryStore.addNotification({
    kind: "deploy",
    id,
    logo: await getActiveTabLogo(),
    origin,
    data,
  });

  const popupId = await openNotificationPopUp();
  const address = await waitApprove<string>(id, popupId);
  return address;
};
