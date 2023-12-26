import * as amplitude from "@amplitude/analytics-browser";
import { useQuery } from "@tanstack/react-query";
import { sha256_sync } from "@ton/crypto";
import React, { useCallback, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AccountState } from "../../libs/entries/account";
import { WalletState } from "../../libs/entries/wallet";
import { NotificationData } from "../../libs/event";
import { TransactionState } from "../../libs/service/transfer/tonService";
import {
  QueryType,
  getAnalytics,
  getAuthConfiguration,
  getNetwork,
  getNetworkConfig,
} from "../../libs/store/browserStore";
import { WalletStateContext } from "../context";

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
    const network = await getNetwork();

    if (!enabled || !key) return false;

    amplitude.init(key, undefined, {
      defaultTracking: {
        sessions: true,
        pageViews: true,
        formInteractions: true,
        fileDownloads: false,
      },
    });

    const walletId = wallet
      ? sha256_sync(wallet.address).toString("hex")
      : "new-user";

    const event = new amplitude.Identify();
    event.set("walletType", toWalletType(wallet));
    event.set("isHardware", wallet?.ledger != null);
    event.set("network", network);
    event.set("walletId", walletId);
    event.set(`accounts_${network}`, account.wallets.length);
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
  useEffect(() => {
    if (data === true) {
      const eventProperties = {
        pathname: location.pathname,
      };
      amplitude.track("Page View", eventProperties);
    }
  }, [data, location.pathname]);

  return data;
};

export const AnalyticsContext = React.createContext<boolean | undefined>(
  undefined
);

export const useNotificationAnalytics = (
  item: NotificationData | undefined
) => {
  const enable = useContext(AnalyticsContext);

  useEffect(() => {
    if (enable === true && item != null) {
      amplitude.track("Notification", {
        name: item.kind,
        origin: item.origin,
      });
    }
  }, [enable, item]);
};

const getTransactionKind = (state: TransactionState, wallet: WalletState) => {
  if (state.isEncrypt) {
    return "encrypted-message";
  }
  if (wallet.ledger) {
    return "ledger-transaction";
  }
  if (typeof state.data == "string") {
    return "text-message";
  }
  return "ton";
};

export const useTransactionAnalytics = () => {
  const enable = useContext(AnalyticsContext);
  const wallet = useContext(WalletStateContext);

  return useCallback(
    (state: TransactionState) => {
      if (enable === true) {
        amplitude.track("Send Transaction", {
          kind: getTransactionKind(state, wallet),
        });
      }
    },
    [enable]
  );
};

export const useDecryptAnalytics = () => {
  const enable = useContext(AnalyticsContext);

  return useCallback(
    (king: "v1" | "standard") => {
      if (enable === true) {
        amplitude.track("Decrypt payload", { king });
      }
    },
    [enable]
  );
};
