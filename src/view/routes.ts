export enum AppRoute {
  settings = "/settings",
  notification = "/notification",
  import = "/import",
  connect = "/connect",
  connections = "/connections",
  home = "/",
  receive = "/receive",
  send = "/send",
  activities = "/activities",
  asset = "/asset",
  wallet = "/wallet",
}

export const any = (route: string): string => {
  return `${route}/*`;
};

export const relative = (path: string): string => {
  return `.${path}`;
};
