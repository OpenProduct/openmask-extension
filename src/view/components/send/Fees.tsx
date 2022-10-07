import { EstimateFeeValues, fromNano } from "@openmask/web-sdk";
import { FC } from "react";
import { fiatFees } from "../../utils";
import { TextLine } from "../Components";
import { Dots } from "../Dots";

export const Fees: FC<{ estimation?: EstimateFeeValues }> = ({
  estimation,
}) => {
  if (!estimation) {
    return (
      <TextLine>
        <Dots>Loading</Dots>
      </TextLine>
    );
  }
  const totalTon = fromNano(
    String(
      estimation.fwd_fee +
        estimation.in_fwd_fee +
        estimation.storage_fee +
        estimation.gas_fee
    )
  );

  return (
    <TextLine>
      Network: ~<b>{fiatFees.format(parseFloat(totalTon))} TON</b>
    </TextLine>
  );
};
