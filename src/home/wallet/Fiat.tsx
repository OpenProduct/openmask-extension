import { FC, useMemo } from "react";
import styled from "styled-components";
import { useCoinPrice } from "../../lib/api";

const Price = styled.span`
  margin: 0 0 20px;
  font-size: large;
  font-weight: bold;
  color: ${(props) => props.theme.darkGray};
`;

const fiatFormat = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export const Fiat: FC<{ balance?: string }> = ({ balance }) => {
  const { data: price } = useCoinPrice(balance != null);

  const value = useMemo(() => {
    if (price && balance) {
      return `${fiatFormat.format(parseFloat(balance) * price)}`;
    } else {
      return "-";
    }
  }, [price, balance]);

  if (!balance) {
    return null;
  }

  return <Price>{value}$</Price>;
};
