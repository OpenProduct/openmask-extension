import { FC } from "react";
import ExtensionPlatform from "../../libs/service/extension";
import { useCopyToClipboard } from "../hooks/useCopyToClipbpard";
import { useNetworkConfig } from "../screen/home/api";
import { toShortAddress } from "../utils";
import { ButtonNegative, InlineLink, Text } from "./Components";
import { CheckIcon, CopyIcon, LinkIcon } from "./Icons";

export interface AddressBlockProps {
  label: string;
  address?: string;
}

const AddressLine: FC<{ address: string }> = ({ address }) => {
  const [copied, handleCopy] = useCopyToClipboard();

  return (
    <ButtonNegative onClick={() => handleCopy(address)}>
      {toShortAddress(address)} {copied ? <CheckIcon /> : <CopyIcon />}
    </ButtonNegative>
  );
};

export const AddressBlock: FC<AddressBlockProps> = ({ label, address }) => {
  const config = useNetworkConfig();

  return (
    <>
      <Text>
        <b>{label}</b>{" "}
        {address && (
          <InlineLink
            onClick={() =>
              ExtensionPlatform.openTab({
                url: `${config.scanUrl}/address/${address}`,
              })
            }
          >
            Open tonscan.org <LinkIcon />
          </InlineLink>
        )}
      </Text>
      <Text>
        {address ? (
          <AddressLine address={address} />
        ) : (
          "Wallet Address Not Define"
        )}
      </Text>
    </>
  );
};
