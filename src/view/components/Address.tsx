import { FC } from "react";
import styled from "styled-components";
import { ArrowRightIcon } from "./Icons";

const Block = styled.div`
  padding: 5px 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.padding};
  font-size: medium;
  border: 1px solid ${(props) => props.theme.darkGray};
`;

const Icon = styled.span`
  font-size: large;
`;

type Props = {
  left: string | null;
  right: string | null;
};

export const Address: FC<Props> = ({ left, right }) => {
  return (
    <Block>
      {left}
      <Icon>
        <ArrowRightIcon />
      </Icon>
      {right}
    </Block>
  );
};
