import React from "react";
import { JettonAsset } from "../../../../../../libs/entries/asset";

export const JettonMinterAddressContext = React.createContext<string>(
  undefined!
);

export const JettonStateContext = React.createContext<JettonAsset>(undefined!);
