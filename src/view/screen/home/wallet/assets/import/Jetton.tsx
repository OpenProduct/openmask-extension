import { JettonData } from "@openmask/web-sdk";
import { useCallback, useMemo, useState } from "react";
import styled from "styled-components";
import { JettonName } from "../../../../../../libs/entries/asset";
import {
  Body,
  ButtonColumn,
  ButtonPositive,
  ErrorMessage,
  ErrorText,
  Gap,
  Input,
} from "../../../../../components/Components";
import { Dots } from "../../../../../components/Dots";
import { HomeButton } from "../../../../../components/HomeButton";
import { JettonRow } from "../../../../../components/JettonRow";
import {
  JettonWalletData,
  useJettonMinterMutation,
  useJettonNameMutation,
  useJettonWalletMutation,
} from "./api";
import { AssetsTabs } from "./Tabs";

const Label = styled.div`
  margin: ${(props) => props.theme.padding} 0 5px;
`;

const Block = styled.div`
  margin-top: ${(props) => props.theme.padding};
`;

export const ImportJetton = () => {
  const [jetton, setJetton] = useState<JettonData | null>(null);
  const [jettonName, setJettonName] = useState<JettonName | null>(null);
  const [jettonWallet, setJettonWallet] = useState<JettonWalletData | null>(
    null
  );

  const [minter, setMinter] = useState("");

  const [symbol, setSymbol] = useState("");
  const [symbolError, setSymbolError] = useState("");

  const {
    mutateAsync: jettonDataAsync,
    isLoading: isDataLoading,
    error,
    reset,
  } = useJettonMinterMutation();

  const { mutateAsync: jettonNameAsync, isLoading: isNameLoading } =
    useJettonNameMutation();

  const { mutateAsync: jettonWalletAsync, isLoading: isWalletLoading } =
    useJettonWalletMutation();

  const onSearch = useCallback(async () => {
    reset();
    const data = await jettonDataAsync(minter);
    setJetton(data);

    await Promise.all([
      jettonWalletAsync(minter).then((wallet) => setJettonWallet(wallet)),
      jettonNameAsync(data.jettonContentUri).then((name) =>
        setJettonName(name)
      ),
    ]);
  }, [reset, jettonDataAsync, setJetton, setJettonName, minter]);

  const onAdd = useCallback(() => {}, []);

  const isLoading = isDataLoading || isNameLoading || isWalletLoading;
  const Button = () => {
    if (isLoading) {
      return (
        <ButtonPositive disabled={true}>
          <Dots>Loading</Dots>
        </ButtonPositive>
      );
    }
    if (jetton == null) {
      return <ButtonPositive onClick={onSearch}>Search</ButtonPositive>;
    }

    return <ButtonPositive onClick={onAdd}>Add Jetton</ButtonPositive>;
  };

  const state = useMemo<JettonName>(() => {
    if (jettonName) {
      return jettonName;
    }
    if (symbol) {
      return {
        symbol,
        name: symbol,
      };
    }
    return {
      symbol: "COIN",
      name: "Name not loaded",
    };
  }, [jettonName, symbol]);

  return (
    <>
      <HomeButton />
      <AssetsTabs />
      <Body>
        <Label>Jetton Minter address</Label>
        <Input
          disabled={jetton != null}
          value={minter}
          onChange={(e) => setMinter(e.target.value)}
          onBlur={onSearch}
        />
        {!isLoading && jetton != null && (
          <>
            <Label>Jetton Symbol</Label>
            <Input value={symbol} onChange={(e) => setSymbol(e.target.value)} />
            {symbolError && <ErrorText>{symbolError}</ErrorText>}
          </>
        )}

        {!isLoading && jetton != null && (
          <Block>
            <JettonRow state={state} balance={jettonWallet?.balance} />;
          </Block>
        )}

        {error && <ErrorMessage>{error.message}</ErrorMessage>}

        <Gap />
        <ButtonColumn>
          <Button />
        </ButtonColumn>
      </Body>
    </>
  );
};
