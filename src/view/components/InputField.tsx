import React, { FC } from "react";
import styled from "styled-components";
import { ErrorText, Input } from "./Components";

const Label = styled.div`
  margin: ${(props) => props.theme.padding} 0 5px;
`;

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: Error;
}

export const InputField: FC<InputFieldProps> = ({ label, error, ...props }) => {
  return (
    <>
      <Label>{label}</Label>
      <Input {...props} />
      {error && <ErrorText>{error.message}</ErrorText>}
    </>
  );
};
