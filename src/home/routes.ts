export enum AppRoute {
  home = "/",
  unlock = "/unlock",
  receive = "/receive",
  send = "/send",
  activities = "/activities",
}

export const any = (route: AppRoute): string => {
  return `${route}/*`;
};
