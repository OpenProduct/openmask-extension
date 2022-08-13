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

export const HomeButton = () => {
  const navigate = useNavigate();
  return (
    <Block>
      <Button onClick={() => navigate("/")}>
        <BackIcon /> Back to Home
      </Button>
    </Block>
  );
};
