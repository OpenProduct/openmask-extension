import React, { FC } from "react";
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
  margin: 0 10px;
`;

const Item = styled.div`
  min-width: 80px;
  word-break: break-all;
`;

type Props = {
  left: string | null;
  right: string | null;
};

export const AddressTransfer: FC<Props> = React.memo(({ left, right }) => {
  return (
    <Block>
      <Item>{left}</Item>
      <Icon>
        <ArrowRightIcon />
      </Icon>
      <Item>{right}</Item>
    </Block>
  );
});
