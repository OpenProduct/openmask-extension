import React, { FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import {
  Asset,
  JettonAsset,
  NftAsset,
} from "../../../../../libs/entries/asset";
import ExtensionPlatform from "../../../../../libs/service/extension";
import { AssetView } from "../../../../components/Asset";
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

const seeIfJettonAsset = (asset: Asset): asset is JettonAsset => {
  return "minterAddress" in asset;
};

const JettonAssetView: FC<{ asset: JettonAsset }> = React.memo(({ asset }) => {
  const navigate = useNavigate();
  const { data } = useJettonWalletBalance(asset);

  return (
    <AssetView
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

const NftAssetView: FC<{ asset: NftAsset }> = React.memo(({ asset }) => {
  return <div>{asset.collectionAddress}</div>;
});

export const AssetsList: FC<{ balance?: string; price?: number }> = ({
  balance,
  price,
}) => {
  const navigate = useNavigate();
  const wallet = useContext(WalletStateContext);

  return (
    <>
      <AssetView
        name="TON"
        logo={<TonIcon />}
        balance={balance}
        price={price}
      />
      {(wallet.assets ?? []).map((asset) =>
        seeIfJettonAsset(asset) ? (
          <JettonAssetView asset={asset} />
        ) : (
          <NftAssetView asset={asset} />
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
