import React from "react";
import styled from "styled-components";
import { ErrorText, Input } from "./Components";

const Label = styled.div`
  margin: ${(props) => props.theme.padding} 0 5px;
`;

export interface InputFieldProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: Error | null;
}

export const InputField = React.forwardRef<HTMLInputElement, InputFieldProps>(
  ({ label, error, ...props }, ref) => {
    return (
      <>
        <Label>{label}</Label>
        <Input {...props} ref={ref} />
        {error && <ErrorText>{error.message}</ErrorText>}
      </>
    );
  }
);
