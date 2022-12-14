import BN from "bn.js";
import { FC, useMemo } from "react";
import styled, { css } from "styled-components";
import { ipfsProxy } from "../../libs/service/requestService";
import { formatAmountValue } from "../../libs/state/decimalsService";
import { formatCoinValue, useCoinFiat } from "../utils";
import { Gap } from "./Components";
import { ArrowForwardIcon, BaseLogoIcon } from "./Icons";

export interface AssetProps {
  name: string;
  logo?: React.ReactElement;
  logoUrl?: string;
  fiat?: string;
  onShow?: () => void;
}

export interface AssetJettonProps extends AssetProps {
  decimals?: number | string;
  balance?: string | BN;
  price?: number;
}

const Block = styled.div<{ pointer: boolean }>`
  width: 100%;
  display: flex;
  flex-direction: row;
  border-bottom: 2px solid ${(props) => props.theme.gray};
  min-height: 100px;

  ${(props) =>
    props.pointer &&
    css`
      cursor: pointer;
    `}
`;

const ImageBlock = styled.div`
  shrink: 0;
  padding: ${(props) => props.theme.padding};
  display: flex;
  align-items: center;
  color: ${(props) => props.theme.darkGray};
`;
const ImageIcon = styled.div`
  font-size: 3em;
`;

const Text = styled.div`
  grow: 1;
  padding: ${(props) => props.theme.padding};
  display: flex;
  justify-content: center;
  line-height: 1.5;
  flex-direction: column;
`;

const Balance = styled.div`
  font-weight: bold;
  font-size: large;

  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const Fiat = styled.div`
  color: ${(props) => props.theme.lightColor};
`;

const Forward = styled.div`
  display: flex;
  height: 100%;
  align-items: center;
  cursor: pointer;
  font-size: 200%;
  padding: 0 30px 0 ${(props) => props.theme.padding};

  &:hover {
    color: ${(props) => props.theme.darkGray};
  }
`;

const Round = styled.img`
  border-radius: 50%;
`;

export const AssetJettonView: FC<AssetJettonProps> = ({
  name,
  balance,
  decimals,
  price,
  ...props
}) => {
  const formatted = useMemo(() => {
    if (!balance) {
      return "0";
    }
    return formatCoinValue(formatAmountValue(balance, decimals));
  }, [balance]);

  const fiat = useCoinFiat(formatted, price);

  return <AssetItemView name={`${formatted} ${name}`} fiat={fiat} {...props} />;
};

export const AssetItemView: FC<AssetProps> = ({
  name,
  logo,
  logoUrl,
  fiat,
  onShow,
}) => {
  return (
    <Block pointer={onShow != null} onClick={onShow}>
      <ImageBlock>
        {logo ? (
          <ImageIcon>{logo}</ImageIcon>
        ) : logoUrl ? (
          <Round
            alt="Asset Logo"
            src={ipfsProxy(logoUrl)}
            width="40px"
            height="40px"
          />
        ) : (
          <ImageIcon>
            <BaseLogoIcon />
          </ImageIcon>
        )}
      </ImageBlock>
      <Text>
        <Balance>{name}</Balance>
        {fiat && <Fiat>{fiat}$</Fiat>}
      </Text>
      <Gap />
      {onShow && (
        <Forward>
          <ArrowForwardIcon />
        </Forward>
      )}
    </Block>
  );
};
