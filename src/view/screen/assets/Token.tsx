import { useCallback } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "../../components/Tabs";
import { AppRoute } from "../../routes";

export enum AssetRoutes {
  jettons = "/jettons",
  nfts = "/nfts",
}

const tabs = ["Jetton", "NFT"];

export const AssetTabs = () => {
  const navigate = useNavigate();

  const location = useLocation();

  const onChange = useCallback(
    (tab: typeof tabs[number]) => {
      navigate(
        AppRoute.assets +
          (tab === tabs[1] ? AssetRoutes.nfts : AssetRoutes.jettons),
        {
          replace: true,
        }
      );
    },
    [navigate]
  );

  const active =
    location.pathname === AppRoute.assets + AssetRoutes.nfts
      ? tabs[1]
      : tabs[0];

  return <Tabs options={tabs} active={active} onChange={onChange} />;
};
