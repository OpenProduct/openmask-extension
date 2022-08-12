import styled from "styled-components";

export const Container = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: ${(props) => props.theme.padding};
  box-sizing: border-box;
`;

export const H1 = styled.h1`
  font-size: 1.5rem;
  line-height: 130%;
`;

const Button = styled.button`
  padding: ${(props) => props.theme.padding};
  width: 100%;
  border-radius: ${(props) => props.theme.padding};
  cursor: pointer;
  font-size: medium;
`;

const ButtonGroup = styled.div`
  width: 100%;
  display: flex;
  gap: ${(props) => props.theme.padding};
`;

export const ButtonColumn = styled(ButtonGroup)`
  flex-direction: column;
`;

export const ButtonRow = styled(ButtonGroup)`
  flex-direction: row;
`;

export const ButtonPositive = styled(Button)`
  border: 1px solid ${(props) => props.theme.color};
  background: ${(props) => props.theme.color};
  color: ${(props) => props.theme.background};

  &:hover {
    background: #374151;
  }
`;

export const ButtonNegative = styled(Button)`
  border: 1px solid ${(props) => props.theme.color};
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color};

  &:hover {
    background: #f9fafb;
  }
`;

export const Badge = styled.div`
  border: 1px solid ${(props) => props.theme.darkGray};
  padding: 5px 20px;
  border-radius: 20px;
`;

export const Icon = styled.span`
  color: ${(props) => props.theme.darkGray};
  font-size: 200%;
  border-radius: 50%;
  width: 1em;
  height: 1em;
  display: inline-block;
  cursor: pointer;
  padding: 5px;

  &:hover {
    background: ${(props) => props.theme.gray};
    color: ${(props) => props.theme.color};
  }
`;
