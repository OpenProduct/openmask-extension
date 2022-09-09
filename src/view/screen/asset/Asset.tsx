import ExtensionPlatform from "../../../libs/service/extension";
import { Body, Center, H1, Text, TextLink } from "../../components/Components";
import { HomeButton } from "../../components/HomeButton";
import { LinkIcon } from "../../components/Icons";

export const Asset = () => {
  return (
    <>
      <HomeButton />
      <Body>
        <Center>
          <H1>Manage assets feature is coming soon</H1>
          <Text>
            OpenMask team realizes how useful maybe the feature to manage
            different assets such as altcoins (aka jettons) or NFT. The service
            is going to deliver this feature as soon as possible.
          </Text>
          <Text>
            Please stay tuned to our telegram channel to not lost updates:
          </Text>
          <TextLink
            onClick={() => {
              ExtensionPlatform.openTab({
                url: `https://t.me/openproduct`,
              });
            }}
          >
            https://t.me/openproduct <LinkIcon />
          </TextLink>
        </Center>
      </Body>
    </>
  );
};
