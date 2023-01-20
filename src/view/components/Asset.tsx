import BigNumber from "bignumber.js";
import { FC, useMemo } from "react";
import styled, { css } from "styled-components";
import { AppStock } from "../../libs/entries/stock";
import { ipfsProxy } from "../../libs/service/requestService";
import { formatDecimals } from "../../libs/state/decimalsService";
import { balanceFormat, fiatFormat } from "../utils";
import { Gap } from "./Components";
import { ArrowForwardIcon, BaseLogoIcon } from "./Icons";

export interface AssetProps {
  name: string;
  logo?: React.ReactElement;
  logoUrl?: string;
  fiat?: string;
  onShow?: () => void;
  stocks?: AppStock[];
}

export interface AssetJettonProps extends AssetProps {
  decimals?: number;
  balance?: string;
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
  const [formatted, fiat] = useMemo(() => {
    if (!balance) {
      return ["0", undefined] as const;
    }

    const amount = new BigNumber(balance);

    const formatted = balanceFormat.format(formatDecimals(amount, decimals));
    let fiat: string | undefined = undefined;
    if (price) {
      fiat = fiatFormat.format(
        formatDecimals(amount.multipliedBy(price), decimals)
      );
    }
    return [formatted, fiat] as const;
  }, [price, balance]);

  return <AssetItemView name={`${formatted} ${name}`} fiat={fiat} {...props} />;
};

export const AssetItemView: FC<AssetProps> = ({
  name,
  logo,
  logoUrl,
  fiat,
  stocks,
  onShow,
}) => {
  const fiatTitle = useMemo(() => {
    return stocks && stocks[0] ? stocks[0].dex : undefined;
  }, [stocks]);

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
        {fiat && <Fiat title={fiatTitle}>{fiat}</Fiat>}
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
