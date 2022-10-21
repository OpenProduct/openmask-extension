import { TonHttpProvider, WalletContract } from "@openproduct/web-sdk";
import React from "react";
import { AccountState } from "../libs/entries/account";
import { WalletState } from "../libs/entries/wallet";

export const AccountStateContext = React.createContext<AccountState>(
  undefined!
);

export const WalletStateContext = React.createContext<WalletState>(undefined!);

export const WalletContractContext = React.createContext<WalletContract>(
  undefined!
);

export const WalletAddressContext = React.createContext<string>(undefined!);

export const TonProviderContext = React.createContext<TonHttpProvider>(
  undefined!
);

export const NetworkContext = React.createContext<string>(undefined!);
