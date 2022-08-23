import React, { FC } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ExtensionPlatform from "../../../../libs/extension";
import { Icon } from "../../../components/Components";
import {
  DropDown,
  DropDownListPayload,
  ListItem,
} from "../../../components/DropDown";
import { LinkIcon, MoreIcon } from "../../../components/Icons";
import { useNetworkConfig } from "../../../lib/state/network";
import { AppRoute } from "../../../routes";

const Menu = styled.div`
  position: absolute;
  right: ${(props) => props.theme.padding};
`;

export const WalletMenu: FC<{ address: string }> = React.memo(({ address }) => {
  const navigate = useNavigate();
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
                Open tonscan.org <LinkIcon />
              </ListItem>
              <ListItem
                onClick={() => {
                  onClose();
                  ExtensionPlatform.openExtensionInBrowser(location.pathname);
                }}
              >
                Expand view <LinkIcon />
              </ListItem>
              <ListItem
                onClick={() => {
                  onClose();
                  navigate(AppRoute.wallet);
                }}
              >
                Wallet Settings
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
