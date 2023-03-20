import { FC, PropsWithChildren, useContext } from "react";
import { WalletState } from "../libs/entries/wallet";
import { FingerprintIcon, UsbIcon } from "./components/Icons";
import { WalletStateContext } from "./context";
import { useAuthConfiguration } from "./screen/settings/api";

export const FingerprintWalletLabel: FC<
  PropsWithChildren<{ wallet: WalletState; isSignature?: boolean }>
> = ({ children, wallet, isSignature = true }) => {
  const { data } = useAuthConfiguration();
  const isWebAuth = data?.kind == "webauthn";

  if (!isSignature) {
    return <>{children}</>;
  }

  if (wallet.ledger) {
    return (
      <>
        {children} <UsbIcon />
      </>
    );
  }

  if (!isWebAuth && isSignature) {
    return <>{children}</>;
  }

  return (
    <>
      {children} <FingerprintIcon />
    </>
  );
};

export const FingerprintLabel: FC<PropsWithChildren> = ({ children }) => {
  const wallet = useContext(WalletStateContext);

  return (
    <FingerprintWalletLabel wallet={wallet}>{children}</FingerprintWalletLabel>
  );
};
