const memoryStore = () => {
  let password: string | null = null;

  return {
    getPassword: () => password,
    setPassword: (newPassword: string | null) => {
      password = newPassword;
    },
    isLock: () => password === null,
  };
};

const instance = memoryStore();

export default instance;
