const isDevelopment = __DEV__;

export const logger = {
  error: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.error(message, ...args);
    }
  },
  warn: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },
  info: (message: string, ...args: unknown[]) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
};
