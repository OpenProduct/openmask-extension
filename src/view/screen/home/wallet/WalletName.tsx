import React, { FC } from "react";
import styled from "styled-components";
import { CheckIcon, CopyIcon } from "../../../components/Icons";
import { useCopyToClipboard } from "../../../lib/hooks/useCopyToClipbpard";
import { toShortAddress } from "../../../lib/state/wallet";

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

export const WalletName: FC<{ address: string; name?: string }> = React.memo(
  ({ address, name }) => {
    const [copied, handleCopy] = useCopyToClipboard();

    return (
      <Block onClick={() => handleCopy(address)}>
        <b>{name}</b>
        <div>
          {toShortAddress(address)} {copied ? <CheckIcon /> : <CopyIcon />}
        </div>
      </Block>
    );
  }
);
