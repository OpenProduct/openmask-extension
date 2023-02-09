import { FC, useContext, useState } from "react";
import styled from "styled-components";
import { NetworkConfig } from "../../../libs/entries/network";
import {
  Body,
  ErrorMessage,
  H1,
  H3,
  Scroll,
} from "../../components/Components";
import { HomeButton } from "../../components/HomeButton";
import { InputField } from "../../components/InputField";
import { NetworksContext } from "../../context";
import { AppRoute } from "../../routes";
import { useNetworkMutation } from "./api";

const Row = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${(props) => props.theme.padding};
  margin: 5px 0;
  padding-bottom: ${(props) => props.theme.padding};
  border-bottom: 1px solid ${(props) => props.theme.darkGray};
  align-items: center;

  > * {
    width: 100%;
  }
`;

const NetworkConfiguration: FC<{ network: NetworkConfig }> = ({ network }) => {
  const {
    mutate: onChange,
    isLoading,
    error,
  } = useNetworkMutation(network.name);
  const [id, setId] = useState(network.id as string);
  const [rpcUrl, setRpsUrl] = useState(network.rpcUrl);
  const [apiKey, setApiKey] = useState(
    network.isCustom ? network.apiKey : "default"
  );
  const [scanUrl, setScanUrl] = useState(network.scanUrl);
  const [rootDnsAddress, setRootDnsAddress] = useState(network.rootDnsAddress);

  const disabled = isLoading || !network.isCustom;

  return (
    <Row>
      <H3>{network.name}</H3>
      {error && <ErrorMessage>{error.message}</ErrorMessage>}
      <label>
        <input
          type="checkbox"
          checked={!!network.isCustom}
          onChange={(e) =>
            onChange({
              isCustom: e.target.checked,
            })
          }
        />
        Custom configuration
      </label>

      <div>
        <InputField
          label="Chain Id"
          disabled={disabled}
          value={id}
          onChange={(e) => setId(e.target.value)}
          onBlur={() => onChange({ id })}
        />
      </div>

      <div>
        <InputField
          label="RPC URL"
          disabled={disabled}
          value={rpcUrl}
          onChange={(e) => setRpsUrl(e.target.value)}
          onBlur={() => onChange({ rpcUrl })}
        />
      </div>

      <div>
        <InputField
          label="RPC Authorization Key"
          disabled={disabled}
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          onBlur={() => onChange({ apiKey })}
        />
      </div>
      <div>
        <InputField
          label="Scan URL"
          disabled={disabled}
          value={scanUrl}
          onChange={(e) => setScanUrl(e.target.value)}
          onBlur={() => onChange({ scanUrl })}
        />
      </div>
      <div>
        <InputField
          label="Root TON DNS Address"
          disabled={disabled}
          value={rootDnsAddress}
          onChange={(e) => setRootDnsAddress(e.target.value)}
          onBlur={() => onChange({ rootDnsAddress })}
        />
      </div>
    </Row>
  );
};
export const NetworkSettings = () => {
  const networks = useContext(NetworksContext);

  return (
    <>
      <HomeButton path={AppRoute.settings} text="Back to Settings" />
      <Body>
        <H1>Networks</H1>

        <Scroll>
          {networks.map((network) => (
            <NetworkConfiguration
              key={`${network.name}${network.isCustom}`}
              network={network}
            />
          ))}
        </Scroll>
      </Body>
    </>
  );
};
