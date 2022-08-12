import React, { FC } from "react";
import styled, { css } from "styled-components";

const Block = styled.div`
  display: flex;
  flex-direction: row;
  width: 100%;
`;

const Item = styled.div<{ active: boolean }>`
flex-grow: 1;
padding: 10px 0;
border-bottom: 2px solid ${(props) => props.theme.lightGray};
cursor: pointer;
text-align: center;
font-size: large;

${(props) =>
  props.active &&
  css`
    border-bottom: 2px solid ${(props) => props.theme.blue};
  `}}
`;

interface TabsProps {
  options: string[];
  active: string;
  onChange: (value: string) => void;
}

export const Tabs: FC<TabsProps> = React.memo(
  ({ options, active, onChange }) => {
    return (
      <Block>
        {options.map((item) => (
          <Item
            key={item}
            active={item === active}
            onClick={() => onChange(item)}
          >
            {item}
          </Item>
        ))}
      </Block>
    );
  }
);
