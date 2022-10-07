import React, { FC, PropsWithChildren } from "react";
import styled from "styled-components";

const Label = styled.div`
  margin: ${(props) => props.theme.padding} 0 5px;
`;

const Code = styled.div`
  padding: 10px;
  background: ${(props) => props.theme.lightGray};
  font-size: medium;
  margin-bottom: ${(props) => props.theme.padding};
  word-break: break-all;
`;

interface Props extends PropsWithChildren {
  label?: string;
}

export const CodeBlock: FC<Props> = React.memo(({ label, children }) => {
  return (
    <>
      {label && <Label>{label}</Label>}
      <Code>{children}</Code>
    </>
  );
});
