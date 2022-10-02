import React from "react";
import { NftAsset, NftItem } from "../../../../../../libs/entries/asset";

export const NftStateContext = React.createContext<NftAsset>(undefined!);
export const NftItemStateContext = React.createContext<NftItem>(undefined!);
