import { useContext, useEffect, useMemo } from "react";
import styled from "styled-components";
import {
  getWalletConnections,
  WalletConnection,
} from "../../../libs/state/connectionSerivce";
import {
  Badge,
  Body,
  Center,
  H1,
  Logo,
  Text,
} from "../../components/Components";
import {
  DropDown,
  DropDownListPayload,
  ListItem,
} from "../../components/DropDown";
import { HomeButton } from "../../components/HomeButton";
import { AccountStateContext } from "../../context";
import { useConnections, useDisconnectMutation } from "./api";

const Scroll = styled.div`
  flex-grow: 1;
  overflow: auto;
`;

const Item = styled.div`
  display: flex;
  gap: ${(props) => props.theme.padding};
  margin: ${(props) => props.theme.padding} 0;
  padding: ${(props) => props.theme.padding} 0;
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
  align-items: center;
`;

const Origin = styled.span`
  flex-grow: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

export const ListTitle = styled.div`
  padding: 10px 20px;
`;

export const Connections = () => {
  const account = useContext(AccountStateContext);
  const { data, isFetching } = useConnections();
  const { mutate: onDelete, isLoading, reset } = useDisconnectMutation(data);

  useEffect(() => {
    reset();
  }, [isFetching]);

  const items = useMemo<WalletConnection[]>(() => {
    if (!data || !account.activeWallet) return [];
    return getWalletConnections(data, account.activeWallet);
  }, [data, isFetching, account]);

  return (
    <>
      <HomeButton />
      <Body>
        <H1>Connected sites</H1>
        <Text>
          Wallet is connected to these sites. They can view your account address
          and balance.
        </Text>
        <Scroll>
          {isFetching && (
            <Center>
              <Text>Loading...</Text>
            </Center>
          )}
          {!isFetching && items.length === 0 && (
            <Center>
              <Text>Empty</Text>
            </Center>
          )}
          {items.map((item) => {
            return (
              <Item key={item.origin}>
                {item.logo && <Logo src={item.logo} alt="Logo" />}
                <Origin>{item.origin}</Origin>
                <DropDown
                  payload={() => (
                    <DropDownListPayload>
                      <ListTitle>
                        Are you sure you want to disconnect?
                      </ListTitle>
                      <ListItem
                        onClick={() => {
                          onDelete({
                            origin: item.origin,
                            wallet: account.activeWallet!,
                          });
                        }}
                      >
                        {isLoading ? "Deleting..." : "Disconnect"}
                      </ListItem>
                    </DropDownListPayload>
                  )}
                >
                  <Badge>Disconnect</Badge>
                </DropDown>
              </Item>
            );
          })}
        </Scroll>
      </Body>
    </>
  );
};

export default Connections;
