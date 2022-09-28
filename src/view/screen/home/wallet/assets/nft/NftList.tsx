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
    <>
      <HomeButton />
      <Scroll>
        <Body>
          <H1>{asset.state?.name ?? "Collection"}</H1>
          <Grid>
            {asset.items.map((item) => {
              if (!item.state) {
                return (
                  <Item key={item.address}>
                    <TextLine>Missing NFT data</TextLine>
                  </Item>
                );
              } else {
                return (
                  <Item
                    key={item.address}
                    onClick={() =>
                      navigate(`./${encodeURIComponent(item.address)}`)
                    }
                  >
                    {item.state?.name && (
                      <TextLine>{item.state?.name}</TextLine>
                    )}
                    <ItemImage src={item.state?.image} alt="NFT image" />
                  </Item>
                );
              }
            })}
          </Grid>
        </Body>
      </Scroll>
    </>
  );
};
