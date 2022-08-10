import { PropsWithChildren, useCallback, useState } from "react";
import styled from "styled-components";

const DropDownContainer = styled.div`
  position: relative;
  display: inline-block;
`;
const DropDownHeader = styled.div`
  cursor: pointer;
`;

const DropDownListContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  z-index: 1;
`;

const DropDownList = styled.div`
  background-color: ${(props) => props.theme.background};
  border: 1px solid ${(props) => props.theme.lightGray};
`;

const ListItem = styled.div`
  cursor: pointer;
  padding: 10px 20px;

  &:hover {
    background: ${(props) => props.theme.lightGray};
  }
`;

export interface DropDownProps<T> extends PropsWithChildren {
  options: T[];
  renderOption: (option: T) => React.ReactNode;
  onSelect: (option: T) => void;
}

export const DropDown = <T extends any>({
  children,
  options,
  renderOption,
  onSelect,
}: DropDownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggling = () => {
    setIsOpen((value) => !value);
  };

  const onOptionClicked = useCallback(
    (option: T) => () => {
      setIsOpen(false);
      onSelect(option);
    },
    [setIsOpen, onSelect]
  );

  return (
    <DropDownContainer>
      <DropDownHeader onClick={toggling}>{children}</DropDownHeader>
      {isOpen && (
        <DropDownListContainer>
          <DropDownList>
            {options.map((option, index) => (
              <ListItem onClick={onOptionClicked(option)} key={index}>
                {renderOption(option)}
              </ListItem>
            ))}
          </DropDownList>
        </DropDownListContainer>
      )}
    </DropDownContainer>
  );
};
