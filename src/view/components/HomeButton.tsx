import { FC } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { Container } from "./Components";
import { BackIcon } from "./Icons";

const Block = styled(Container)`
  width: 100%;
`;
const Button = styled.div`
  cursor: pointer;
`;

export const HomeButton: FC<{ path?: string; text?: string }> = ({
  path = "/",
  text = "Back to Home",
}) => {
  const navigate = useNavigate();
  return (
    <Block>
      <Button onClick={() => navigate(path)}>
        <BackIcon /> {text}
      </Button>
    </Block>
  );
};
