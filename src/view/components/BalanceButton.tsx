import { FC, PropsWithChildren } from "react";
import styled from "styled-components";
import { Container, Icon } from "./Components";

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  align-items: center;
  cursor: pointer;
`;

const Text = styled.span`
  font-size: larger;
`;

const ActionIcon = styled(Icon)`
  background: ${(props) => props.theme.blue};
  color: ${(props) => props.theme.background};
`;

export const BallanceBlock = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const BallanceButtonRow = styled.div`
  display: flex;
  gap: 20px;
`;

export interface BallanceButtonProps extends PropsWithChildren {
  label: string;
  onClick: () => void;
}
export const BallanceButton: FC<BallanceButtonProps> = ({
  onClick,
  label,
  children,
}) => {
  return (
    <Column onClick={onClick}>
      <ActionIcon>{children}</ActionIcon>
      <Text>{label}</Text>
    </Column>
  );
};
