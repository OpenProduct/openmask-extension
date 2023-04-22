import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { JettonMinterContent, JettonMinterData } from "ton-wrappers";
import { JettonWalletData } from "../../../../../../libs/state/assetService";
import {
  Body,
  ButtonColumn,
  ButtonPositive,
  ErrorMessage,
  Gap,
} from "../../../../../components/Components";
import { Dots } from "../../../../../components/Dots";
import { HomeButton } from "../../../../../components/HomeButton";
import { InputField } from "../../../../../components/InputField";
import { JettonRow } from "../../../../../components/JettonRow";
import { AppRoute } from "../../../../../routes";
import { useAddJettonMutation, useJettonFullData } from "./api";
import { AssetsTabs } from "./Tabs";

const Label = styled.div`
  margin: ${(props) => props.theme.padding} 0 5px;
`;

const Block = styled.div`
  margin-top: ${(props) => props.theme.padding};
`;

const toSymbolError = (symbol: string): string | undefined => {
  if (symbol == "") {
    return "The symbol is required";
  }
  if (symbol.length < 3 || symbol.length > 11) {
    return "The symbol length should be in 3 - 11 letter range";
  }
  return undefined;
};

const toDecimalsError = (decimals: string): string | undefined => {
  if (decimals == "") {
    return "The decimals is required";
  }
  if (
    Number(decimals) != parseInt(decimals) ||
    Number(decimals) < 0 ||
    Number(decimals) > 18
  ) {
    return "The decimals should be an integer from 0 to 18";
  }
  return undefined;
};

export const ImportJetton = () => {
  const navigate = useNavigate();

  const [jetton, setJetton] = useState<JettonMinterData | null>(null);
  const [jettonName, setJettonName] = useState<JettonMinterContent | null>(
    null
  );
  const [jettonWallet, setJettonWallet] = useState<JettonWalletData | null>(
    null
  );

  const [minter, setMinter] = useState("");

  const [symbol, setSymbol] = useState("");
  const [symbolError, setSymbolError] = useState<Error | undefined>(undefined);

  const [decimals, setDecimals] = useState("9");
  const [decimalsError, setDecimalsError] = useState<Error | undefined>(
    undefined
  );

  const {
    mutateAsync: jettonFullDataAsync,
    isLoading: isDataLoading,
    error: errorMinter,
    reset: resetFullData,
  } = useJettonFullData();

  const {
    mutateAsync: addJettonAsync,
    isLoading: isAddLoading,
    reset: resetAdd,
    error: errorAdd,
  } = useAddJettonMutation();

  const onSearch = useCallback(async () => {
    resetFullData();
    const { data, wallet, name } = await jettonFullDataAsync(minter);
    setJetton(data);
    setJettonWallet(wallet);
    setJettonName(name);
  }, [resetFullData, jettonFullDataAsync, setJetton, setJettonName, minter]);

  const onAdd = async () => {
    if (jetton == null) return;

    resetAdd();

    let jettonState: JettonMinterContent;

    if (jettonName != null) {
      jettonState = jettonName;
    } else {
      const error = toSymbolError(symbol);
      if (error) {
        setSymbolError(new Error(error));
        return;
      }
      const error2 = toDecimalsError(decimals);
      if (error2) {
        setDecimalsError(new Error(error2));
        return;
      }

      jettonState = {
        symbol: symbol.toUpperCase(),
        name: symbol,
        decimals,
      };
    }

    await addJettonAsync({
      minter,
      jettonState,
      jettonWallet,
    });

    navigate(AppRoute.home);
  };

  const isLoading = isDataLoading;

  const Button = () => {
    if (isLoading || isAddLoading) {
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

  const state = useMemo<JettonMinterContent>(() => {
    if (jettonName) {
      return jettonName;
    }
    return {
      symbol: symbol != "" ? symbol.toUpperCase() : "COIN",
      name: "Name not loaded",
      decimals: toDecimalsError(decimals) === undefined ? decimals : "9",
    };
  }, [jettonName, symbol, decimals]);

  return (
    <>
      <HomeButton />
      <AssetsTabs />
      <Body>
        <InputField
          label="Jetton Minter Contract address"
          disabled={jetton != null}
          value={minter}
          onChange={(e) => setMinter(e.target.value)}
          onBlur={onSearch}
        />

        {!isLoading && jetton != null && jettonName == null && (
          <InputField
            label="Jetton Symbol"
            disabled={isAddLoading}
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            error={symbolError}
          />
        )}
        {!isLoading && jetton != null && jettonName == null && (
          <InputField
            type="number"
            label="Jetton Decimals"
            disabled={isAddLoading}
            value={decimals}
            onChange={(e) => setDecimals(e.target.value)}
            error={decimalsError}
          />
        )}

        {!isLoading && jetton != null && (
          <Block>
            <JettonRow state={state} balance={jettonWallet?.balance} />
          </Block>
        )}

        {errorMinter && <ErrorMessage>{errorMinter.message}</ErrorMessage>}
        {errorAdd && <ErrorMessage>{errorAdd.message}</ErrorMessage>}

        <Gap />
        <ButtonColumn>
          <Button />
        </ButtonColumn>
      </Body>
    </>
  );
};
