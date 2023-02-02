export default (error?: string | Error): string => {
  let str = 'unknown error';

  if (error) {
    if (typeof error === 'string') {
      str = `🚫 操作：${error}`;
    } else if (error instanceof Error) {
      str = `🚫 操作：${error.message}`;
    }
  }

  return str;
};
