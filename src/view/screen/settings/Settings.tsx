import { Route, Routes, useNavigate } from "react-router-dom";
import styled from "styled-components";
import ExtensionPlatform from "../../../libs/service/extension";
import { Body, H1, Text, TextLink } from "../../components/Components";
import { HomeButton } from "../../components/HomeButton";
import { ArrowForwardIcon, LinkIcon } from "../../components/Icons";
import { AppRoute, relative } from "../../routes";
import { ExperimentalSettings } from "./Experimental";
import { GeneralSettings } from "./General";
import { WebAuthnDisableMigration } from "./password/WebAuthnMigrationDisable";
import { WebAuthnEnableMigration } from "./password/WebAuthnMigrationEnable";
import { SettingsRoutes } from "./route";
import packageJson from "../../../../package.json";

const Item = styled.div`
  font-size: large;
  color: ${(props) => props.theme.darkBlue};
  cursor: pointer;
  font-width: bold;
  padding: ${(props) => props.theme.padding} 0;
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

interface SettingsLink {
  route: SettingsRoutes;
  name: string;
}
const SETTINGS: SettingsLink[] = [
  { route: SettingsRoutes.general, name: "General" },
  { route: SettingsRoutes.experimental, name: "Experimental" },
  { route: SettingsRoutes.about, name: "About" },
];

const SettingsIndex = () => {
  const navigate = useNavigate();
  return (
    <>
      <HomeButton />
      <Body>
        <H1>Account Settings</H1>
        {SETTINGS.map((item) => (
          <Item key={item.route} onClick={() => navigate(relative(item.route))}>
            <span>{item.name}</span>
            <ArrowForwardIcon />
          </Item>
        ))}
      </Body>
    </>
  );
};

const AboutSettings = () => {
  return (
    <>
      <HomeButton path={AppRoute.settings} text="Back to Settings" />
      <Body>
        <H1>About</H1>
        <Text>
          <img
            src="tonmask-logo.svg"
            width="68"
            height="68"
            alt="OpenMask Logo"
          />
        </Text>
        <Text>OpenMask Beta version {packageJson.version}</Text>
        <Text>Non-custodial web extension wallet for The Open Network</Text>
        <Text>Links:</Text>
        <TextLink
          onClick={() => {
            ExtensionPlatform.openTab({
              url: `https://openmask.app/`,
            });
          }}
        >
          Visit our website <LinkIcon />
        </TextLink>
        <TextLink
          onClick={() => {
            ExtensionPlatform.openTab({
              url: `https://t.me/openproduct`,
            });
          }}
        >
          Telegram <LinkIcon />
        </TextLink>
        <TextLink
          onClick={() => {
            ExtensionPlatform.openTab({
              url: `https://github.com/OpenProduct`,
            });
          }}
        >
          GitHub <LinkIcon />
        </TextLink>
        <TextLink
          onClick={() => {
            ExtensionPlatform.openTab({
              url: `${packageJson.repository}/issues`,
            });
          }}
        >
          Issue Tracker <LinkIcon />
        </TextLink>
      </Body>
    </>
  );
};

export const Settings = () => {
  return (
    <Routes>
      <Route path={SettingsRoutes.about} element={<AboutSettings />} />
      <Route path={SettingsRoutes.general} element={<GeneralSettings />} />
      <Route
        path={SettingsRoutes.enableWebAuthn}
        element={<WebAuthnEnableMigration />}
      />
      <Route
        path={SettingsRoutes.disableWebAuthn}
        element={<WebAuthnDisableMigration />}
      />
      <Route
        path={SettingsRoutes.experimental}
        element={<ExperimentalSettings />}
      />
      <Route path={SettingsRoutes.index} element={<SettingsIndex />} />
    </Routes>
  );
};

export default Settings;
