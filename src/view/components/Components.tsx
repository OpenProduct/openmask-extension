import styled, { css } from "styled-components";

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

export const H3 = styled.h3`
  font-size: 1.2rem;
  line-height: 110%;
`;

const Button = styled.button<{ disabled?: boolean }>`
  padding: ${(props) => props.theme.padding};
  width: 100%;
  border-radius: ${(props) => props.theme.padding};
  cursor: pointer;
  font-size: medium;

  ${(props) =>
    props.disabled &&
    css`
      opacity: 0.5;
    `}
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

export const ButtonBottomRow = styled(ButtonRow)`
  position: sticky;
  bottom: 0;
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

export const ButtonLink = styled.button`
  width: 100%;
  border: 0;
  outline: 0;
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.blue};
  color: ${(props) => props.theme.darkBlue};
  text-decoration: underline;
  cursor: pointer;
  margin: ${(props) => props.theme.padding} 0;
`;

export const InlineButtonLink = styled(ButtonLink)`
  display: inline;
  margin: 0;
  width: auto;
  font-size: inherit;
`;

export const ButtonDanger = styled(Button)`
  border: 1px solid ${(props) => props.theme.red};
  background: ${(props) => props.theme.background};
  color: ${(props) => props.theme.color};

  &:hover {
    background: ${(props) => props.theme.lightRed};
  }
`;

export const Badge = styled.div`
  border: 1px solid ${(props) => props.theme.darkGray};
  padding: 5px 20px;
  border-radius: 20px;
  cursor: pointer;
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

export const Body = styled(Container)`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  overflow: auto;
`;

export const BodyCenter = styled(Body)`
  align-items: center;
`;

export const Center = styled.div`
  text-align: center;
`;

export const Gap = styled.div`
  flex-grow: 1;
`;

export const ErrorMessage = styled.div`
  margin: ${(props) => props.theme.padding} 0;
  border: 1px solid ${(props) => props.theme.red};
  background: ${(props) => props.theme.lightRed};
  font-size: medium;
  padding: ${(props) => props.theme.padding};
  border-radius: ${(props) => props.theme.padding};
  word-break: break-all;
`;

export const ErrorText = styled.div`
  color: ${(props) => props.theme.red};
  font-size: medium;
  padding-top: 3px;
`;

export const Input = styled.input`
  padding: 10px;
  border: none;
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
  width: 100%;
  outline: none;
  box-sizing: border-box;
`;

export const Title = styled.div`
  font-size: x-large;
  padding-bottom: 25px;
`;

export const Textarea = styled.textarea`
  resize: vertical;
  padding: 10px;
  margin-bottom: ${(props) => props.theme.padding};
`;

export const Text = styled.div`
  padding-bottom: ${(props) => props.theme.padding};
  font-size: medium;
`;

export const TextLink = styled(Text)`
  font-size: large;
  color: ${(props) => props.theme.darkBlue};
  cursor: pointer;
`;

export const Logo = styled.img`
  width: 35px;
  height: 35px;
  background: #ebebeb;
  border: 1px solid ${(props) => props.theme.darkGray};
  border-radius: 50%;
  padding: 5px;
`;
