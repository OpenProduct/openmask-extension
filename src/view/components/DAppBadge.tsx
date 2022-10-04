import { FC } from "react";
import styled from "styled-components";
import { Logo } from "./Components";

const Badge = styled.div`
  border: 1px solid ${(props) => props.theme.darkGray};
  padding: 10px 20px;
  border-radius: 20px;
  display: inline-block;
  font-size: larger;
  display: flex;
  gap: ${(props) => props.theme.padding};
  align-items: center;
`;

const Origin = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`;

type Props = {
  logo?: string;
  origin: string;
};

export const DAppBadge: FC<Props> = ({ logo, origin }) => {
  return (
    <Badge>
      {logo && <Logo src={logo} alt="DApp Logo" />}
      <Origin>{origin}</Origin>
    </Badge>
  );
};
