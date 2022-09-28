import { JettonData } from "@openmask/web-sdk";
import { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { JettonState } from "../../../../../../libs/entries/asset";
import { JettonWalletData } from "../../../../../../libs/service/state/assetService";
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
import { InputField } from "../../../../../components/InputField";
import { JettonRow } from "../../../../../components/JettonRow";
import { AppRoute } from "../../../../../routes";
import {
  useAddJettonMutation,
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

const toSymbolError = (symbol: string): string | undefined => {
  if (symbol == "") {
    return "The symbol is required";
  }
  if (symbol.length < 3 || symbol.length > 11) {
    return "The symbol length should be in 3 - 11 letter range";
  }
  return undefined;
};

export const ImportJetton = () => {
  const navigate = useNavigate();

  const [jetton, setJetton] = useState<JettonData | null>(null);
  const [jettonName, setJettonName] = useState<JettonState | null>(null);
  const [jettonWallet, setJettonWallet] = useState<JettonWalletData | null>(
    null
  );

  const [minter, setMinter] = useState("");

  const [symbol, setSymbol] = useState("");
  const [symbolError, setSymbolError] = useState("");

  const {
    mutateAsync: jettonDataAsync,
    isLoading: isDataLoading,
    error: errorMinter,
    reset: resetMinter,
  } = useJettonMinterMutation();

  const {
    mutateAsync: addJettonAsync,
    isLoading: isAddLoading,
    reset: resetAdd,
    error: errorAdd,
  } = useAddJettonMutation();

  const { mutateAsync: jettonNameAsync, isLoading: isNameLoading } =
    useJettonNameMutation();

  const { mutateAsync: jettonWalletAsync, isLoading: isWalletLoading } =
    useJettonWalletMutation();

  const onSearch = useCallback(async () => {
    resetMinter();
    const data = await jettonDataAsync(minter);
    setJetton(data);

    await Promise.all([
      jettonWalletAsync(minter).then((wallet) => setJettonWallet(wallet)),
      jettonNameAsync(data.jettonContentUri).then((name) =>
        setJettonName(name)
      ),
    ]);
  }, [resetMinter, jettonDataAsync, setJetton, setJettonName, minter]);

  const onAdd = async () => {
    if (jetton == null) return;

    resetAdd();

    let jettonState: JettonState;

    if (jettonName != null) {
      jettonState = jettonName;
    } else {
      const error = toSymbolError(symbol);
      if (error) {
        setSymbolError(error);
        return;
      }

      jettonState = {
        symbol: symbol.toUpperCase(),
        name: symbol,
      };
    }

    await addJettonAsync({
      minter,
      jettonState,
      jettonWallet,
    });

    navigate(AppRoute.home);
  };

  const isLoading = isDataLoading || isNameLoading || isWalletLoading;

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

  const state = useMemo<JettonState>(() => {
    if (jettonName) {
      return jettonName;
    }
    return {
      symbol: symbol != "" ? symbol.toUpperCase() : "COIN",
      name: "Name not loaded",
    };
  }, [jettonName, symbol]);

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
          <>
            <Label>Jetton Symbol</Label>
            <Input
              disabled={isAddLoading}
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
            />
            {symbolError && <ErrorText>{symbolError}</ErrorText>}
          </>
        )}

        {!isLoading && jetton != null && (
          <Block>
            <JettonRow state={state} balance={jettonWallet?.balance} />;
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
