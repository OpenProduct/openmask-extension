export enum AppRoute {
  setting = "/setting",
  import = "/import",
  connect = "/connect",
  home = "/",
  receive = "/receive",
  send = "/send",
  activities = "/activities",
  wallet = "/wallet",
}

export const any = (route: string): string => {
  return `${route}/*`;
};

export const relative = (path: string): string => {
  return `.${path}`;
};
