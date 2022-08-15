export enum AppRoute {
  home = "/",
  receive = "/receive",
  send = "/send",
  activities = "/activities",
  setting = "/setting",
  import = "/import",
  wallet = "/wallet",
}

export const any = (route: AppRoute): string => {
  return `${route}/*`;
};

export const relative = (path: string): string => {
  return `.${path}`;
};
