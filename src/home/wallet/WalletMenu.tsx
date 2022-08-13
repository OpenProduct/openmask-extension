import React, { FC } from "react";
import { useLocation } from "react-router-dom";
import styled from "styled-components";
import { Icon } from "../../components/Components";
import {
  DropDown,
  DropDownListPayload,
  ListItem,
} from "../../components/DropDown";
import { MoreIcon } from "../../components/Icons";
import ExtensionPlatform from "../../lib/extension";
import { useNetworkConfig } from "../../lib/state/network";

const Menu = styled.div`
  position: absolute;
  right: ${(props) => props.theme.padding};
`;

export const WalletMenu: FC<{ address: string }> = React.memo(({ address }) => {
  const config = useNetworkConfig();
  const location = useLocation();

  return (
    <Menu>
      <DropDown
        payload={(onClose) => {
          return (
            <DropDownListPayload>
              <ListItem
                onClick={() => {
                  onClose();
                  ExtensionPlatform.openTab({
                    url: `${config.scanUrl}/address/${address}`,
                  });
                }}
              >
                Open Wallet TonScan
              </ListItem>
              <ListItem
                onClick={() => {
                  onClose();
                  ExtensionPlatform.openExtensionInBrowser(location.pathname);
                }}
              >
                Expand view
              </ListItem>
            </DropDownListPayload>
          );
        }}
      >
        <Icon>
          <MoreIcon />
        </Icon>
      </DropDown>
    </Menu>
  );
});
