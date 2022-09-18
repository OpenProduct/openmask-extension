import { useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ExtensionPlatform from "../../../../libs/service/extension";
import { Icon } from "../../../components/Components";
import {
  DropDown,
  DropDownListPayload,
  ListItem,
} from "../../../components/DropDown";
import { LinkIcon, MoreIcon } from "../../../components/Icons";
import { WalletStateContext } from "../../../context";
import { useNetworkConfig } from "../../home/api";
import { JettonMinterAddressContext, JettonStateContext } from "./context";

const Menu = styled.div`
  position: absolute;
  right: ${(props) => props.theme.padding};
`;

export const JettonMenu = () => {
  const navigate = useNavigate();
  const config = useNetworkConfig();
  const location = useLocation();

  const wallet = useContext(WalletStateContext);
  const minterAddress = useContext(JettonMinterAddressContext);
  const jettonState = useContext(JettonStateContext);

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
                    url: `${config.scanUrl}/address/${wallet}`,
                  });
                }}
              >
                Open Wallet tonscan.org <LinkIcon />
              </ListItem>
              <ListItem
                onClick={() => {
                  onClose();
                  ExtensionPlatform.openTab({
                    url: `${config.scanUrl}/address/${minterAddress}`,
                  });
                }}
              >
                Open Minter tonscan.org <LinkIcon />
              </ListItem>
              {jettonState && jettonState.walletAddress && (
                <ListItem
                  onClick={() => {
                    onClose();
                    ExtensionPlatform.openTab({
                      url: `${config.scanUrl}/address/${jettonState.walletAddress}`,
                    });
                  }}
                >
                  Open Jetton tonscan.org <LinkIcon />
                </ListItem>
              )}
              <ListItem
                onClick={() => {
                  onClose();
                  ExtensionPlatform.openExtensionInBrowser(
                    location.pathname,
                    location.search
                  );
                }}
              >
                Expand view <LinkIcon />
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
};
