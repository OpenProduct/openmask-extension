import { NotificationData, UnfinishedOperation } from "../event";

const memoryStore = () => {
  let password: string | null = null;

  let operation: UnfinishedOperation = null;

  const notifications: NotificationData[] = [];

  return {
    getNotifications: () => notifications,
    addNotification: (item: NotificationData) => notifications.push(item),
    getNotification: () =>
      notifications.length ? notifications[0] : undefined,

    getOperation: () => operation,
    setOperation: (o: UnfinishedOperation) => {
      operation = o;
    },

    getPassword: () => password,
    setPassword: (newPassword: string | null) => {
      password = newPassword;
    },
    isLock: () => password === null,
  };
};

const instance = memoryStore();

export default instance;
