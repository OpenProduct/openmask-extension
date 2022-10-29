import { FC } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { NftAsset } from "../../../../../../libs/entries/asset";
import { Body, H1, Scroll } from "../../../../../components/Components";
import { HomeButton } from "../../../../../components/HomeButton";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-auto-rows: 160px;
  gap: ${(props) => props.theme.padding};
`;

const Item = styled.div`
  cursor: pointer;
  padding: 5;
  border: 1px solid ${(props) => props.theme.darkGray};
  border-radius: 20px;
  text-align: center;
  height: 100%;
  overflow: hidden;
`;

const ItemImage = styled.img`
  max-height: 130px;
  max-width: 100%;
`;

const TextLine = styled.div`
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 20px;
  padding: 0 10px;
  overflow: hidden;
`;

export const NftList: FC<{ asset: NftAsset }> = ({ asset }) => {
  const navigate = useNavigate();
  return (
    <Scroll>
      <HomeButton />
      <Body>
        <H1>{asset.state?.name ?? "Collection"}</H1>
        <Grid>
          {asset.items.map(({ state, address }) => {
            if (!state) {
              return (
                <Item key={address}>
                  <TextLine>Missing NFT data</TextLine>
                </Item>
              );
            } else {
              return (
                <Item
                  key={address}
                  onClick={() => navigate(`./${encodeURIComponent(address)}`)}
                >
                  {state.name && <TextLine>{state.name}</TextLine>}
                  {"image" in state && (
                    <ItemImage src={state.image} alt="NFT image" />
                  )}
                  {"domain" in state && (
                    <>
                      {state.domain}.{state.root}
                    </>
                  )}
                </Item>
              );
            }
          })}
        </Grid>
      </Body>
    </Scroll>
  );
};
