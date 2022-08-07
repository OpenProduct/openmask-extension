import styled from "styled-components";
import { Container } from "../components/Components";
import { QueryType, useMutateStore, useNetwork } from "../lib/state";

const Head = styled(Container)`
  flex-shrink: 0;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid ${(props) => props.theme.border};
`;

export const Header = () => {
  const { data } = useNetwork();

  const { mutateAsync, reset } = useMutateStore<string>(QueryType.network);

  const onClick = async () => {
    await mutateAsync(data === "Testnet" ? "Mainnet" : "Testnet");
    reset();
  };

  return (
    <Head>
      <img src="tonmask-logo.svg" width="38" height="38" alt="TonMask Logo" />
      <span onClick={onClick}>{data}</span>
    </Head>
  );
};
