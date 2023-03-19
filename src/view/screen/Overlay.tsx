import styled, { css } from "styled-components";

export const Splash = styled.div<{ active: boolean }>`
  z-index: 10;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  opacity: 0;
  background: ${(props) => props.theme.background};
  transition: opacity 0.3s ease-in-out;

  ${(props) =>
    props.active &&
    css`
      opacity: 0.5;
    `}
`;

export const Block = styled.form<{ active: boolean }>`
  z-index: 20;
  position: fixed;
  left: 0;
  right: 0;
  height: 280px;
  bottom: -280px;
  transition: bottom 0.3s ease-in-out;
  background: ${(props) => props.theme.background};
  border-top: 1px solid ${(props) => props.theme.darkGray};

  ${(props) =>
    props.active &&
    css`
      bottom: 0;
    `}
`;

export const Grid = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: ${(props) => props.theme.padding};
`;
