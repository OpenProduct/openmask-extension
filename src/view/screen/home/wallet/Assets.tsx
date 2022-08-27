import { FC } from "react";
import { Asset } from "../../../components/Asset";
import {
  Center,
  Gap,
  InlineButtonLink,
  Text,
} from "../../../components/Components";
import { TonIcon } from "../../../components/Icons";

export const Assets: FC<{ balance?: string; price?: number }> = ({
  balance,
  price,
}) => {
  return (
    <>
      <Asset name="TON" logo={<TonIcon />} balance={balance} price={price} />
      <Gap />
      <Center>
        <Text>
          Don't see your token?{" "}
          <InlineButtonLink>Import Jettons</InlineButtonLink>
        </Text>
      </Center>
    </>
  );
};
