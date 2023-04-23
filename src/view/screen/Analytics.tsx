import * as amplitude from "@amplitude/analytics-browser";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { sha256_sync } from "ton-crypto";
import { AccountState } from "../../libs/entries/account";
import { WalletState } from "../../libs/entries/wallet";
import {
  getAnalytics,
  getAuthConfiguration,
  getNetwork,
  getNetworkConfig,
  QueryType,
} from "../../libs/store/browserStore";

const toWalletType = (wallet?: WalletState): string => {
  if (!wallet) return "new-user";
  if (wallet.ledger) return "ledger";
  return wallet.version;
};

export const useInitAnalytics = (
  account: AccountState,
  wallet?: WalletState
) => {
  return useQuery([QueryType.analytics, wallet?.address], async () => {
    const key = process.env.REACT_APP_AMPLITUDE;
    const enabled = await getAnalytics();

    if (!enabled || !key) return false;

    const userId = wallet
      ? sha256_sync(wallet.address).toString("hex")
      : "new-user";

    amplitude.init(key, userId, {
      defaultTracking: {
        sessions: true,
        pageViews: true,
        formInteractions: true,
        fileDownloads: false,
      },
    });

    const event = new amplitude.Identify();
    event.setOnce("userId", userId);
    event.setOnce("network", await getNetwork());
    event.setOnce("accounts", account.wallets.length);
    event.setOnce("authType", (await getAuthConfiguration()).kind);
    event.setOnce("walletType", toWalletType(wallet));
    event.setOnce("isHardware", wallet?.ledger != null);
    event.setOnce(
      "isCustomNetwork",
      (await getNetworkConfig()).some((item) => item.isCustom)
    );

    amplitude.identify(event);

    return true;
  });
};

export const useAnalytics = (account: AccountState, wallet?: WalletState) => {
  const location = useLocation();
  const { data } = useInitAnalytics(account, wallet);

  useEffect(() => {
    if (data === true) {
      amplitude.track("Page View", {
        pathname: location.pathname,
      });
    }
  }, [data, location.pathname]);
};
