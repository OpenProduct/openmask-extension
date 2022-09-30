import React, { FC, useMemo } from "react";
import styled from "styled-components";
import { NftItemState } from "../../libs/entries/asset";
import { ipfsProxy } from "../../libs/service/requestService";
import { Text } from "./Components";

const Block = styled.div`
  padding: 0 0 ${(props) => props.theme.padding} 0;
`;

const ImageWrapper = styled.div`
  padding: ${(props) => props.theme.padding};
  margin-bottom: ${(props) => props.theme.padding};
  border: 1px solid ${(props) => props.theme.darkGray};
  border-radius: 20px;
  text-align: center;
`;

const NftImage = styled.img`
  max-height: 200px;
  max-width: 100%;
`;

export const NftPayload: FC<{ state?: NftItemState | null }> = React.memo(
  ({ state }) => {
    const image = useMemo(() => {
      if (state) {
        return ipfsProxy(state.image);
      }
    }, [state]);
    if (!state) {
      return (
        <Block>
          <Text>Missing NFT content</Text>
        </Block>
      );
    }

    return (
      <Block>
        {state.name && (
          <Text>
            <b>{state.name}</b>
          </Text>
        )}
        <ImageWrapper>
          <NftImage src={image} alt="NFT image" />
        </ImageWrapper>
        {state.description && <Text>{state.description}</Text>}
      </Block>
    );
  }
);
