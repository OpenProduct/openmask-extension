import { FC, PropsWithChildren, useContext } from "react";
import { FingerprintIcon, UsbIcon } from "./components/Icons";
import { WalletStateContext } from "./context";
import { useAuthConfiguration } from "./screen/settings/api";

export const FingerprintLabel: FC<PropsWithChildren> = ({ children }) => {
  const wallet = useContext(WalletStateContext);
  const { data } = useAuthConfiguration();
  const isWebAuth = data?.kind == "webauthn";

  if (wallet.isLadger) {
    return (
      <>
        {children} <UsbIcon />
      </>
    );
  }

  if (!isWebAuth) {
    return <>{children}</>;
  }
  return (
    <>
      {children} <FingerprintIcon />
    </>
  );
};
