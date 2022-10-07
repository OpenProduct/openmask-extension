import { DeployInputParams } from "../../entries/transactionMessage";
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
  data: DeployInputParams,
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

  try {
    const popupId = await openNotificationPopUp();
    return await waitApprove<DeployInputParams>(id, popupId);
  } finally {
    memoryStore.removeNotification(id);
  }
};
