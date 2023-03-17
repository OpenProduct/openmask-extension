import { FC, PropsWithChildren } from "react";
import { FingerprintIcon } from "./components/Icons";
import { useAuthConfiguration } from "./screen/settings/api";

export const FingerprintLabel: FC<PropsWithChildren> = ({ children }) => {
  const { data } = useAuthConfiguration();
  const isWebAuth = data?.kind == "webauthn";
  if (!isWebAuth) {
    return <>{children}</>;
  }
  return (
    <>
      {children} <FingerprintIcon />
    </>
  );
};
