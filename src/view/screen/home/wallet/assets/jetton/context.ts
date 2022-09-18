import React from "react";
import { JettonState } from "../../../../../../libs/entries/asset";

export const JettonMinterAddressContext = React.createContext<string>(
  undefined!
);

export const JettonStateContext = React.createContext<JettonState>(undefined!);
