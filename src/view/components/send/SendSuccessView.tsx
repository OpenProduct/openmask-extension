import { FC } from "react";
import { useNavigate } from "react-router-dom";
import ExtensionPlatform from "../../../libs/service/extension";
import { AppRoute } from "../../routes";
import { useSelectedNetworkConfig } from "../../screen/home/api";
import {
  Body,
  ButtonColumn,
  ButtonNegative,
  ButtonPositive,
  Center,
  Gap,
  H1,
  Text,
} from "../Components";
import { LinkIcon } from "../Icons";
import { LoadingLogo } from "../Logo";

export interface Props {
  address: string;
  homeRoute?: string;
}

export const SendSuccessView: FC<Props> = ({
  address,
  homeRoute = AppRoute.home,
}) => {
  const navigate = useNavigate();
  const config = useSelectedNetworkConfig();

  return (
    <Body>
      <Gap />
      <LoadingLogo />
      <Center>
        <H1>Confirm</H1>
        <Text>Transaction finished</Text>
      </Center>
      <ButtonColumn>
        <ButtonNegative
          onClick={() => {
            ExtensionPlatform.openTab({
              url: `${config.scanUrl}${address}`,
            });
          }}
        >
          View in explorer <LinkIcon />
        </ButtonNegative>
        <ButtonPositive
          onClick={() => {
            navigate(homeRoute);
          }}
        >
          Close
        </ButtonPositive>
      </ButtonColumn>
      <Gap />
    </Body>
  );
};
