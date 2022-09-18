import React, { FC, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Asset } from "../../../../../libs/entries/asset";
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
import packageJson from "/package.json";

const Line = styled(Text)`
  padding: 10px 0 5px;
`;

export const AlternativeAsset: FC<{ asset: Asset }> = React.memo(
  ({ asset }) => {
    const { data } = useJettonWalletBalance(asset.minterAddress);
    return (
      <AssetView
        name={asset.state.symbol}
        logoUrl={asset.state.image}
        balance={data}
      />
    );
  }
);

export const Assets: FC<{ balance?: string; price?: number }> = ({
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
      {(wallet.assets ?? []).map((asset) => (
        <AlternativeAsset asset={asset} />
      ))}
      <Gap />
      <Center>
        <Line>
          Don't see your tokens?{" "}
          <InlineButtonLink onClick={() => navigate(AppRoute.asset)}>
            Import Jetton
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
