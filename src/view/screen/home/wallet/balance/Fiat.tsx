import { FC } from "react";
import styled from "styled-components";
import { useTonFiat } from "../../../../utils";

const Price = styled.span`
  margin: 0 0 20px;
  font-size: large;
  font-weight: bold;
  color: ${(props) => props.theme.lightColor};
`;

export const Fiat: FC<{ balance?: string; price?: number }> = ({
  balance,
  price,
}) => {
  const value = useTonFiat(balance, price);
  return <Price>USD {value ?? "-"}$</Price>;
};
