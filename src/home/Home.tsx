import styled from "styled-components";
import { Badge, Container, Icon } from "../components/Components";
import {
  DropDown,
  DropDownListPayload,
  ListItem,
} from "../components/DropDown";
import { MoreIcon, TonIcon } from "../components/Icons";
import { WalletName } from "../components/WalletName";
import ExtensionPlatform from "../lib/extension";
import { useAccountState } from "../lib/state/account";
import { useNetworkConfig } from "../lib/state/network";
import { useAddress, useBalance, useWalletContract } from "../lib/state/wallet";
import { Header } from "./Header";

const Body = styled.div`
  width: 100%;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const Wallet = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${(props) => props.theme.lightGray};
  position: relative;
  padding: 5px ${(props) => props.theme.padding};
`;

const Balance = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Connect = styled(Badge)`
  position: absolute;
  left: ${(props) => props.theme.padding};
  padding: 5px 8px;
  font-size: smaller;
`;

const Menu = styled.div`
  position: absolute;
  right: ${(props) => props.theme.padding};
`;

const Amount = styled.span`
  margin: ${(props) => props.theme.padding} 0;
  font-size: xx-large;
  font-weight: bold;
`;

const useActiveWallet = () => {
  const { data } = useAccountState();

  console.log(data);

  return data?.wallets.find((i) => i.address === data.activeWallet)!;
};

export const Home = () => {
  const config = useNetworkConfig();
  const wallet = useActiveWallet();
  const contract = useWalletContract(wallet);
  const { data: balance } = useBalance(wallet, contract);
  const { data: address } = useAddress(wallet, contract);
  return (
    <>
      <Header />
      <Body>
        <Wallet>
          <Connect>Connected</Connect>
          {wallet && <WalletName wallet={wallet} />}
          <Menu>
            <DropDown
              payload={(onClose) => {
                return (
                  <DropDownListPayload>
                    <ListItem
                      onClick={() => {
                        onClose();
                        ExtensionPlatform.openTab({
                          url: `${config.scanUrl}/account/${address?.toString(
                            true,
                            false,
                            true
                          )}`,
                        });
                      }}
                    >
                      Open ton scan
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
        </Wallet>
        <Balance>
          <TonIcon />
          <Amount>{balance} TON</Amount>
        </Balance>
      </Body>
    </>
  );
};
