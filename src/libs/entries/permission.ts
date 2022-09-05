export enum Permission {
  // See address, account balance, activity and suggest transactions to approve
  base = "base",
  // Allow to switch networks
  switchNetwork = "switchNetwork",
}

export const PermissionList = [Permission.base, Permission.switchNetwork];
