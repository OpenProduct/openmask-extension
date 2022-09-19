import { FC } from "react";
import styled from "styled-components";
import { JettonName } from "../../libs/entries/asset";
import { IconSize } from "./Components";
import { BaseLogoIcon } from "./Icons";

const Row = styled.div`
  display: inline-flex;
  gap: ${(props) => props.theme.padding};
  align-items: center;
  padding-bottom: ${(props) => props.theme.padding};
`;

const Font = styled.span`
  font-size: large;
  overflow: hidden;
  text-overflow: ellipsis;
`;

interface Props {
  state: JettonName;
  balance: string | undefined;
}

export const JettonRow: FC<Props> = ({ state, balance }) => {
  return (
    <Row>
      {state.image ? (
        <img alt="Jetton Logo" width="35px" height="35px" src={state.image} />
      ) : (
        <IconSize>
          <BaseLogoIcon />
        </IconSize>
      )}
      <Font>
        {state.name} ({balance ?? 0} {state.symbol})
      </Font>
    </Row>
  );
};
