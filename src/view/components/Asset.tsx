import { FC, useMemo } from "react";
import styled from "styled-components";
import { formatTonValue } from "../screen/api";
import { useTonFiat } from "../screen/home/wallet/balance/Fiat";
import { Gap } from "./Components";
import { ArrowForwardIcon, BaseLogoIcon } from "./Icons";

export interface AssetProps {
  name: string;
  logo?: React.ReactElement;
  logoUrl?: string;
  balance?: string;
  price?: number;
  onShow?: () => void;
}

const Block = styled.div`
  width: 100%;
  display: flex;
  flex-direction: row;
  border-bottom: 2px solid ${(props) => props.theme.gray};
  min-height: 100px;
`;

const Image = styled.div`
  shrink: 0;
  padding: ${(props) => props.theme.padding};
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.darkGray};
  font-size: 3em;
`;

const Text = styled.div`
  grow: 1;
  padding: ${(props) => props.theme.padding};
  display: flex;
  justify-content: center;
  line-height: 1.5;
  flex-direction: column;
`;

const Balance = styled.div`
  font-weight: bold;
  font-size: large;
`;

const Fiat = styled.div`
  color: ${(props) => props.theme.lightColor};
`;

const Forward = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  cursor: pointer;
  font-size: 200%;
  padding: 0 ${(props) => props.theme.padding};
`;

export const AssetView: FC<AssetProps> = ({
  name,
  logo,
  logoUrl,
  balance,
  price,
  onShow,
}) => {
  const fiat = useTonFiat(balance, price);

  const formatted = useMemo(() => {
    return balance ? formatTonValue(balance) : "0";
  }, [balance]);

  return (
    <Block>
      <Image>
        {logo ? (
          logo
        ) : logoUrl ? (
          <img alt="Coin Logo" src={logoUrl} width="40px" height="40px" />
        ) : (
          <BaseLogoIcon />
        )}
      </Image>
      <Text>
        <Balance>
          {formatted} {name}
        </Balance>
        {fiat && <Fiat>{fiat}$</Fiat>}
      </Text>
      <Gap />
      {onShow && (
        <Forward onClick={onShow}>
          <ArrowForwardIcon />
        </Forward>
      )}
    </Block>
  );
};
