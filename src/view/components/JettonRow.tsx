import React, { FC } from "react";
import styled from "styled-components";
import { JettonState } from "../../libs/entries/asset";
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
  state: JettonState;
  balance: string | undefined;
}

export const JettonRow: FC<Props> = React.memo(({ state, balance }) => {
  return (
    <Row>
      <JettonLogo image={state.image} />
      <Font>
        {state.name} ({balance ?? 0} {state.symbol})
      </Font>
    </Row>
  );
});

export const JettonLogo: FC<{ image?: string; size?: number }> = React.memo(
  ({ image, size = 35 }) => {
    return image ? (
      <img
        alt="Jetton Logo"
        width={size + "px"}
        height={size + "px"}
        src={image}
      />
    ) : (
      <IconSize>
        <BaseLogoIcon />
      </IconSize>
    );
  }
);
