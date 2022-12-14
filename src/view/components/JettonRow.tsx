import React, { FC } from "react";
import styled from "styled-components";
import { JettonState } from "../../libs/entries/asset";
import { ipfsProxy } from "../../libs/service/requestService";
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

const Image = styled.img`
  border-radius: 50%;
`;

export const JettonLogo: FC<{ image?: string; size?: number }> = React.memo(
  ({ image, size = 35 }) => {
    return image ? (
      <Image
        alt="Jetton Logo"
        width={size + "px"}
        height={size + "px"}
        src={ipfsProxy(image)}
      />
    ) : (
      <IconSize>
        <BaseLogoIcon />
      </IconSize>
    );
  }
);
