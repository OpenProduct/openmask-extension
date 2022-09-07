export enum Permission {
  // Read address, account balance, activity from unlocked wallet
  base = "base",
  // Read address, account balance, activity from locked wallet
  locked = "locked",
  // Allow to switch networks with notification
  switchNetwork = "switchNetwork",
}

export const PermissionList = [
  Permission.base,
  Permission.locked,
  Permission.switchNetwork,
];
