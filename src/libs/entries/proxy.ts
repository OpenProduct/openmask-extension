export type ProxyConfiguration =
  | EnabledProxyConfiguration
  | DisabledProxyConfiguration;

interface ProxyHost {
  host: string;
  port: string;
}

export interface EnabledProxyConfiguration {
  enabled: true;
  domains: Record<string, ProxyHost>;
}

export interface DisabledProxyConfiguration {
  enabled: false;
}

export const defaultProxyConfiguration: ProxyConfiguration = {
  enabled: false,
};

/**
 * Source: https://ton.org/docs/#/web3/sites-and-proxy?id=running-entry-proxy
 */
export const publicTonProxy: ProxyHost[] = [
  { host: "in1.ton.org", port: "8080" },
  { host: "in2.ton.org", port: "8080" },
  { host: "in3.ton.org", port: "8080" },
];

export const defaultTonProxyConfiguration: ProxyConfiguration = {
  enabled: true,
  domains: {
    ton: publicTonProxy[1],
  },
};
