import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Body, Text } from "../../components/Components";
import { HomeButton } from "../../components/HomeButton";
import { AssetTabs } from "./Token";

export const JettonView = () => {
  const params = useParams();

  const minterAddress = useMemo(() => {
    return decodeURIComponent(params.minterAddress!);
  }, [params]);

  return (
    <Body>
      <Text>Jetton</Text>
      <Text>{minterAddress}</Text>
    </Body>
  );
};

export const ImportJetton = () => {
  return (
    <>
      <HomeButton />
      <AssetTabs />
      <Body>Import Jetton</Body>
    </>
  );
};
