import { FC } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import ExtensionPlatform from "../../../../libs/service/extension";
import { Asset } from "../../../components/Asset";
import {
  Center,
  Gap,
  InlineButtonLink,
  Text,
} from "../../../components/Components";
import { LinkIcon, TonIcon } from "../../../components/Icons";
import { AppRoute } from "../../../routes";

const Line = styled(Text)`
  padding-bottom: 5px;
`;

export const Assets: FC<{ balance?: string; price?: number }> = ({
  balance,
  price,
}) => {
  const navigate = useNavigate();
  return (
    <>
      <Asset name="TON" logo={<TonIcon />} balance={balance} price={price} />
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
                url: `https://github.com/TonMask/tonmask-extension/issues`,
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
