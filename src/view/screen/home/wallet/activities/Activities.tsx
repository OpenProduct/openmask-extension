import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { TonWebTransaction } from "../../../../../libs/entries/transaction";
import { ActivitiesList } from "../../../../components/ActivitiesList";
import { ButtonNegative } from "../../../../components/Components";
import { Dots } from "../../../../components/Dots";
import { FingerprintIcon } from "../../../../components/Icons";
import { WalletAddressContext } from "../../../../context";
import { useAuthConfiguration } from "../../../settings/api";
import { useDecryptMutation, useTransactions } from "./api";

const Row = styled.div`
  padding: ${(props) => props.theme.padding};
`;

export const Activities = () => {
  const address = useContext(WalletAddressContext);

  const [txs, setTxs] = useState<TonWebTransaction[] | undefined>();
  const { data: transactions, isLoading } = useTransactions();

  const { data } = useAuthConfiguration();
  const isWebAuth = data?.kind == "webauthn";

  useEffect(() => {
    setTxs(transactions);
  }, [transactions]);

  const { mutateAsync, isLoading: isDecrypting } = useDecryptMutation();
  const onDecrypt = async () => {
    if (txs) {
      setTxs(await mutateAsync(txs));
    }
  };

  return (
    <>
      <Row>
        <ButtonNegative onClick={onDecrypt}>
          {isDecrypting ? (
            <Dots>Decrypting</Dots>
          ) : (
            <>
              Decrypt e2e encrypted messages {isWebAuth && <FingerprintIcon />}
            </>
          )}
        </ButtonNegative>
      </Row>
      <ActivitiesList isLoading={isLoading} data={txs} address={address} />
    </>
  );
};
