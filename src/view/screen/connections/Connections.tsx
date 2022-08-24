import { useEffect, useMemo } from "react";
import styled from "styled-components";
import { Badge, Body, Center, H1, Text } from "../../components/Components";
import {
  DropDown,
  DropDownListPayload,
  ListItem,
} from "../../components/DropDown";
import { HomeButton } from "../../components/HomeButton";
import { useConnections, useDisconnectMutation } from "./api";

const Scroll = styled.div`
  flex-grow: 1;
  overflow: auto;
`;

const Item = styled.div`
  display: flex;
  flex-gap: ${(props) => props.theme.padding};
  margin: ${(props) => props.theme.padding} 0;
  padding: ${(props) => props.theme.padding} 0;
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
  align-items: center;
`;

const Logo = styled.img`
    width: 30px
    height: 30px
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
  const { data, isFetching } = useConnections();
  const { mutate: onDelete, isLoading, reset } = useDisconnectMutation(data);

  useEffect(() => {
    reset();
  }, [data]);

  const items = useMemo(() => {
    if (!data) return [];
    return Object.entries(data).map(([origin, { logo }]) => ({ origin, logo }));
  }, [data]);

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
              <Text>Empty...</Text>
            </Center>
          )}
          {items.map((item) => {
            return (
              <Item key={item.origin}>
                {item.logo && <Logo src={item.logo} alt="Origin logo" />}
                <Origin>{item.origin}</Origin>
                <DropDown
                  payload={() => (
                    <DropDownListPayload>
                      <ListTitle>
                        Are you sure you want to disconnect?
                      </ListTitle>
                      <ListItem
                        onClick={() => {
                          onDelete(item.origin);
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
