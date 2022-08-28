import { UnfinishedOperation } from "../event";

const memoryStore = () => {
  let password: string | null = null;

  let operation: UnfinishedOperation = null;

  return {
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
