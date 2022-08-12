import { FC, useMemo } from "react";
import styled from "styled-components";

const Price = styled.span`
  margin: 0 0 20px;
  font-size: large;
  font-weight: bold;
  color: ${(props) => props.theme.lightColor};
`;

const fiatFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const useTonFiat = (balance?: string, price?: number) => {
  return useMemo(() => {
    if (price && balance) {
      return `${fiatFormat.format(parseFloat(balance) * price)}`;
    } else {
      return undefined;
    }
  }, [price, balance]);
};

export const Fiat: FC<{ balance?: string; price?: number }> = ({
  balance,
  price,
}) => {
  const value = useTonFiat(balance, price);
  return <Price>{value ?? "-"}$</Price>;
};
