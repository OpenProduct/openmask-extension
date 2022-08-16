export enum AppRoute {
  setting = "/setting",
  connect = "/connect",
  home = "/",
  receive = "/receive",
  send = "/send",
  activities = "/activities",
  wallet = "/wallet",
}

export const any = (route: AppRoute): string => {
  return `${route}/*`;
};

export const relative = (path: string): string => {
  return `.${path}`;
};
