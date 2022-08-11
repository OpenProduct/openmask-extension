import styled from "styled-components";
import { Badge, Container, Icon } from "../components/Components";
import { DropDownList } from "../components/DropDown";
import { UserIcon } from "../components/Icons";
import { QueryType, useMutateStore, useNetwork } from "../lib/state";
import { networkConfigs } from "../lib/state/network";

const Head = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.lightGray};
`;

export const Header = () => {
  const { data } = useNetwork();

  const { mutate } = useMutateStore<string>(QueryType.network);

  return (
    <Head>
      <img src="tonmask-logo.svg" width="38" height="38" alt="TonMask Logo" />
      <DropDownList
        options={networkConfigs}
        renderOption={(c) => c.name}
        onSelect={(c) => mutate(c.name)}
      >
        <Badge>{data}</Badge>
      </DropDownList>
      <Icon>
        <UserIcon />
      </Icon>
    </Head>
  );
};
