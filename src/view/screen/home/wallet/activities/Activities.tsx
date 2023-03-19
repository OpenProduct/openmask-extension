import { useContext, useEffect, useState } from "react";
import styled from "styled-components";
import { TonWebTransaction } from "../../../../../libs/entries/transaction";
import { ActivitiesList } from "../../../../components/ActivitiesList";
import { ButtonNegative } from "../../../../components/Components";
import { Dots } from "../../../../components/Dots";
import { WalletStateContext } from "../../../../context";
import { FingerprintLabel } from "../../../../FingerprintLabel";
import { useDecryptMutation, useTransactions } from "./api";

const Row = styled.div`
  padding: ${(props) => props.theme.padding};
`;

export const Activities = () => {
  const wallet = useContext(WalletStateContext);

  const [txs, setTxs] = useState<TonWebTransaction[] | undefined>();
  const { data: transactions, isLoading } = useTransactions();

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
      {!wallet.ledger && (
        <Row>
          <ButtonNegative onClick={onDecrypt}>
            {isDecrypting ? (
              <Dots>Decrypting</Dots>
            ) : (
              <FingerprintLabel>
                Decrypt e2e encrypted messages
              </FingerprintLabel>
            )}
          </ButtonNegative>
        </Row>
      )}

      <ActivitiesList
        isLoading={isLoading}
        data={txs}
        address={wallet.address}
      />
    </>
  );
};
