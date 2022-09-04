import { FC, useContext, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import styled from "styled-components";
import { WalletState } from "../../../libs/entries/wallet";
import {
  Body,
  ButtonBottomRow,
  ButtonNegative,
  ButtonPositive,
  Center,
  Gap,
  H1,
  Logo,
  Text,
} from "../../components/Components";
import { AccountStateContext } from "../../context";
import { sendBackground } from "../../event";
import { useBalance } from "../home/api";
import { useAddConnectionMutation } from "./api";

const Badge = styled.div`
  border: 1px solid ${(props) => props.theme.darkGray};
  padding: 10px 20px;
  border-radius: 20px;
  display: inline-block;
  font-size: larger;
  display: flex;
  gap: ${(props) => props.theme.padding};
  align-items: center;
`;

const Label = styled.label`
  display: flex;
  gap: ${(props) => props.theme.padding};
  margin: ${(props) => props.theme.padding};
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
`;

const Origin = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
`;
const Column = styled.div`
  overflow: hidden;
  flex-grow: 1;
  padding: 5px;
`;

const Row = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const Balance = styled(Row)`
  color: ${(props) => props.theme.darkGray};
`;

const Scroll = styled.div`
  overflow: auto;
`;

const Wallet: FC<{
  wallet: WalletState;
  selected: boolean;
  onSelect: (value: boolean) => void;
}> = ({ wallet, selected, onSelect }) => {
  const { data } = useBalance(wallet.address);

  return (
    <Label key={wallet.address}>
      <input
        type="checkbox"
        checked={selected}
        onChange={() => onSelect(!selected)}
      />
      <Column>
        <Row>
          <b>{wallet.name}</b>
        </Row>
        <Row>{wallet.address}</Row>
        <Balance>{data ?? "-"} TON</Balance>
      </Column>
    </Label>
  );
};

export const ConnectDApp = () => {
  const [searchParams] = useSearchParams();
  const origin = searchParams.get("origin");
  const id = parseInt(searchParams.get("id") ?? "0", 10);
  const logo = searchParams.get("logo");

  useEffect(() => {
    if (!origin) {
      sendBackground.message("rejectRequest", id);
    }
  }, []);

  const account = useContext(AccountStateContext);

  const { mutate, isLoading } = useAddConnectionMutation();
  const [selected, setSelected] = useState(
    account.wallets.map((w) => w.address)
  );

  const onCancel = () => {
    sendBackground.message("rejectRequest", id);
  };

  const onConnect = () => {
    mutate({ id, origin: origin!, wallets: selected, logo });
  };

  return (
    <Body>
      <Center>
        <Badge>
          {logo && <Logo src={logo} alt="Logo" />}
          <Origin>{origin}</Origin>
        </Badge>
        <H1>Connect With OpenMask</H1>
        <Text>Select the account(s) to use on this site</Text>
      </Center>
      <Scroll>
        {account.wallets.map((wallet) => {
          return (
            <Wallet
              key={wallet.address}
              wallet={wallet}
              selected={selected.includes(wallet.address)}
              onSelect={(value) => {
                if (value) {
                  setSelected((items) => items.concat([wallet.address]));
                } else {
                  setSelected((items) =>
                    items.filter((item) => item !== wallet.address)
                  );
                }
              }}
            />
          );
        })}
      </Scroll>
      <Gap />
      <ButtonBottomRow>
        <ButtonNegative onClick={onCancel} disabled={isLoading}>
          Cancel
        </ButtonNegative>
        <ButtonPositive onClick={onConnect} disabled={isLoading}>
          Connect
        </ButtonPositive>
      </ButtonBottomRow>
    </Body>
  );
};
