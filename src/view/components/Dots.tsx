import { FC, PropsWithChildren, useEffect, useState } from "react";
import styled from "styled-components";

const Block = styled.span`
  display: inline-block;
  width: 8px;
`;

export const Dots: FC<PropsWithChildren> = ({ children }) => {
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => setTimer(timer < 3 ? timer + 1 : 0), 400);
    return () => {
      clearTimeout(timeout);
    };
  }, [timer]);

  return (
    <>
      {children}
      <Block>.{".".repeat(timer)}</Block>
    </>
  );
};
