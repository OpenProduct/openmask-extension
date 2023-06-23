import { TonHttpProvider } from "@openproduct/web-sdk";
import React from "react";
import { TonClient } from "ton";
import { AccountState } from "../libs/entries/account";
import { NetworkConfig } from "../libs/entries/network";
import { WalletState } from "../libs/entries/wallet";

export const AccountStateContext = React.createContext<AccountState>(
  undefined!
);

export const WalletStateContext = React.createContext<WalletState>(undefined!);

export const WalletAddressContext = React.createContext<string>(undefined!);

/**
 * @deprecated
 */
export const TonProviderContext = React.createContext<TonHttpProvider>(
  undefined!
);

export const TonClientContext = React.createContext<TonClient>(undefined!);
export const NetworkContext = React.createContext<string>(undefined!);
export const NetworksContext = React.createContext<NetworkConfig[]>(undefined!);
