import React from "react";
import TonWeb from "tonweb";
import { WalletContract } from "tonweb/dist/types/contract/wallet/wallet-contract";
import { AccountState } from "../lib/state/account";
import { WalletState } from "../lib/state/wallet";

export const AccountStateContext = React.createContext<AccountState>(
  undefined!
);

export const WalletStateContext = React.createContext<WalletState>(undefined!);

export const WalletContractContext = React.createContext<WalletContract>(
  undefined!
);

export const WalletAddressContext = React.createContext<string>(undefined!);

export const TonProviderContext = React.createContext<TonWeb>(undefined!);

export const NetworkContext = React.createContext<string>(undefined!);
