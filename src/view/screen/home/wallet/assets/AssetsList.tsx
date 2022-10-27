import React, { FC, useContext, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { JettonAsset, NftAsset } from "../../../../../libs/entries/asset";
import ExtensionPlatform from "../../../../../libs/service/extension";
import { seeIfJettonAsset } from "../../../../../libs/state/assetService";
import { AssetItemView, AssetJettonView } from "../../../../components/Asset";
import {
  Center,
  Gap,
  InlineButtonLink,
  Text,
} from "../../../../components/Components";
import { LinkIcon, TonIcon } from "../../../../components/Icons";
import { WalletStateContext } from "../../../../context";
import { AppRoute } from "../../../../routes";
import { useJettonWalletBalance } from "./api";
import { AssetRoutes } from "./route";
import packageJson from "/package.json";

const Line = styled(Text)`
  padding: 10px 0 5px;
`;

const JettonRowView: FC<{ asset: JettonAsset }> = React.memo(({ asset }) => {
  const navigate = useNavigate();
  const { data } = useJettonWalletBalance(asset);

  return (
    <AssetJettonView
      name={asset.state.symbol}
      logoUrl={asset.state.image}
      balance={data}
      onShow={() =>
        navigate(
          AppRoute.assets +
            AssetRoutes.jettons +
            "/" +
            encodeURIComponent(asset.minterAddress)
        )
      }
    />
  );
});

const NftRowView: FC<{ asset: NftAsset }> = React.memo(({ asset }) => {
  const navigate = useNavigate();
  const name = useMemo(() => {
    if (asset.state?.name) {
      return asset.state?.name!;
    }

    const item = asset.items.find((item) => item.state?.name);
    if (item) {
      return item.state?.name!;
    }

    return "Unknown";
  }, [asset]);

  const logoUrl = useMemo(() => {
    if (asset.state?.image) {
      return asset.state?.image;
    }
    const item = asset.items.find(
      (item) => item.state && "image" in item.state
    );
    if (item) {
      return (
        (item.state && "image" in item.state && item.state.image) || undefined
      );
    }
    return undefined;
  }, [asset]);

  const url = useMemo(() => {
    const collection =
      AppRoute.assets +
      AssetRoutes.nfts +
      "/" +
      encodeURIComponent(asset.collectionAddress);

    if (asset.items.length !== 1) {
      return collection;
    }

    return collection + "/" + encodeURIComponent(asset.items[0].address);
  }, [asset]);

  return (
    <AssetItemView name={name} logoUrl={logoUrl} onShow={() => navigate(url)} />
  );
});

export const AssetsList: FC<{ balance?: string; price?: number }> = ({
  balance,
  price,
}) => {
  const navigate = useNavigate();
  const wallet = useContext(WalletStateContext);

  return (
    <>
      <AssetJettonView
        name="TON"
        logo={<TonIcon />}
        balance={balance}
        price={price}
      />
      {(wallet.assets ?? []).map((asset) =>
        seeIfJettonAsset(asset) ? (
          <JettonRowView asset={asset} />
        ) : (
          <NftRowView asset={asset} />
        )
      )}
      <Gap />
      <Center>
        <Line>
          Don't see your tokens?{" "}
          <InlineButtonLink
            onClick={() => navigate(AppRoute.assets + AssetRoutes.jettons)}
          >
            Import Token
          </InlineButtonLink>
        </Line>
        <Text>
          Need help?{" "}
          <InlineButtonLink
            onClick={() => {
              ExtensionPlatform.openTab({
                url: `${packageJson.repository}/issues`,
              });
            }}
          >
            Contact us! <LinkIcon />
          </InlineButtonLink>
        </Text>
      </Center>
    </>
  );
};
