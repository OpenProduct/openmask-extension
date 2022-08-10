import { FC } from "react";
import styled from "styled-components";
import { WalletState } from "../lib/state/wallet";
import { CopyIcon } from "./Icons";

const Block = styled.div`
  cursor: pointer;
  border-radius: 5px;
  text-align: center;
  padding: 5px 15px;
  line-height: 1.6;
  max-width: 140px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;

  &:hover {
    background: ${(props) => props.theme.gray};
  }
`;

export const WalletName: FC<{ wallet: WalletState }> = ({ wallet }) => {
  const copyToClipBoard = async () => {
    try {
      await navigator.clipboard.writeText(wallet.address);
    } catch (err) {
      console.log("Failed to copy!");
    }
  };

  const shortAddress =
    wallet.address.slice(0, 4) + "...." + wallet.address.slice(-4);

  return (
    <Block onClick={copyToClipBoard}>
      <b>{wallet.name}</b>
      <div>
        {shortAddress} <CopyIcon />
      </div>
    </Block>
  );
};
