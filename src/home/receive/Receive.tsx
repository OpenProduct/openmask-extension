import styled from "styled-components";
import {
  ButtonColumn,
  ButtonPositive,
  Container,
} from "../../components/Components";

const Body = styled(Container)`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
`;

export const Receive = () => {
  return (
    <Body>
      <ButtonColumn>
        <ButtonPositive>ETH bridge</ButtonPositive>
        <ButtonPositive>Receive TON</ButtonPositive>
      </ButtonColumn>
    </Body>
  );
};
