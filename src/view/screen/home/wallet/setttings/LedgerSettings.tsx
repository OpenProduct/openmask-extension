import { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LedgerDriver,
  LedgerState,
  WalletState,
} from "../../../../../libs/entries/wallet";
import {
  Body,
  ButtonDanger,
  ButtonNegative,
  H1,
  Input,
  SelectLabel,
  SelectPayload,
} from "../../../../components/Components";
import { Dots } from "../../../../components/Dots";
import { DropDownList } from "../../../../components/DropDown";
import { HomeButton } from "../../../../components/HomeButton";
import { ArrowDownIcon, DeleteIcon } from "../../../../components/Icons";
import { WalletStateContext } from "../../../../context";
import { relative } from "../../../../routes";
import {
  useConnectLedgerDevice,
  useLedgerDevice,
  useUnPairLedgerDevice,
} from "../../../ledger/api";
import { useUpdateWalletMutation } from "./api";
import { WalletRoutes } from "./route";

const drivers: LedgerDriver[] = ["USB", "HID"];

const DeviceSelect = () => {
  const wallet = useContext(WalletStateContext);
  const { data: device } = useLedgerDevice(wallet);
  const { mutate: unpair, isLoading: isUnpairing } = useUnPairLedgerDevice(
    wallet?.ledger?.driver
  );

  const { mutate: connect, isLoading: isConnecting } =
    useConnectLedgerDevice(wallet);

  if (device === undefined) return null;

  if (device === null) {
    return (
      <>
        <SelectLabel>Connect Device</SelectLabel>
        <ButtonNegative onClick={() => connect()} disabled={isConnecting}>
          {isConnecting ? <Dots>Loading</Dots> : "Connect"}
        </ButtonNegative>
      </>
    );
  }

  return (
    <>
      <SelectLabel>
        Connected Device: {device.productName}, ID: {device.productId}
      </SelectLabel>
      {/* <ButtonNegative onClick={() => unpair()} disabled={isUnpairing}>
        {isUnpairing ? <Dots>Loading</Dots> : "Unpair"}
      </ButtonNegative> */}
    </>
  );
};

export const LedgerSettings = () => {
  const navigate = useNavigate();

  const wallet = useContext(WalletStateContext);

  const [name, setName] = useState(wallet.name);

  const { mutateAsync, reset } = useUpdateWalletMutation();
  const onChange = async (fields: Partial<WalletState>) => {
    reset();
    await mutateAsync(fields);
  };

  const onChangeLedger = async (fields: Partial<LedgerState>) => {
    const ledger: LedgerState = { ...wallet.ledger!, ...fields };

    reset();
    await mutateAsync({ ledger });
  };

  return (
    <>
      <HomeButton />
      <Body>
        <H1>Wallet Settings</H1>

        <SelectLabel>Wallet Name</SelectLabel>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onBlur={() => {
            onChange({ name });
          }}
        />

        <SelectLabel>Driver</SelectLabel>
        <DropDownList
          isLeft
          options={drivers}
          renderOption={(value) => value}
          onSelect={(value) => onChangeLedger({ driver: value })}
        >
          <SelectPayload>
            {wallet.ledger?.driver}
            <ArrowDownIcon />
          </SelectPayload>
        </DropDownList>

        <DeviceSelect />

        <SelectLabel>Delete Wallet</SelectLabel>
        <ButtonDanger onClick={() => navigate(relative(WalletRoutes.delete))}>
          Delete Wallet <DeleteIcon />
        </ButtonDanger>
      </Body>
    </>
  );
};
