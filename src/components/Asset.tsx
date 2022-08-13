import { FC } from "react";
import styled from "styled-components";
import { useTonFiat } from "../home/wallet/balance/Fiat";
import { BaseLogoIcon } from "./Icons";

export interface AssetProps {
  name: string;
  logo?: React.ReactElement;
  logoUrl?: string;
  balance?: string;
  price?: number;
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

export const Asset: FC<AssetProps> = ({
  name,
  logo,
  logoUrl,
  balance,
  price,
}) => {
  const fiat = useTonFiat(balance, price);

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
          {balance} {name}
        </Balance>
        {fiat && <Fiat>{fiat}$</Fiat>}
      </Text>
    </Block>
  );
};
