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
import { useNetwork } from "../api";

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

    amplitude.init(key, undefined, {
      defaultTracking: {
        sessions: true,
        pageViews: true,
        formInteractions: true,
        fileDownloads: false,
      },
    });

    const network = await getNetwork();

    const event = new amplitude.Identify();
    event.set(`accounts`, `${network}-${account.wallets.length}`);
    event.set("authType", (await getAuthConfiguration()).kind);
    event.set(
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
  const { data: network } = useNetwork();
  useEffect(() => {
    if (data === true) {
      const walletId = wallet
        ? sha256_sync(wallet.address).toString("hex")
        : "new-user";

      const eventProperties = {
        pathname: location.pathname,
        network,
        walletId,
        walletType: toWalletType(wallet),
        isHardware: wallet?.ledger != null,
      };
      amplitude.track("Page View", eventProperties);
    }
  }, [data, wallet, location.pathname, network]);
};
