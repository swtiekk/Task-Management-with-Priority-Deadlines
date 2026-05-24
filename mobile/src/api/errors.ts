export const extractApiErrorMessage = (error: any, fallback: string) => {
  const data = error?.response?.data;

  if (!data) {
    if (error?.message === 'Network Error') {
      return 'Cannot reach the server. Check the mobile API host and your network connection.';
    }
    return fallback;
  }

  if (typeof data === 'string') {
    return data;
  }

  if (typeof data.error === 'string') {
    return data.error;
  }

  if (typeof data.detail === 'string') {
    return data.detail;
  }

  const firstValue = Object.values(data)[0];
  if (Array.isArray(firstValue) && typeof firstValue[0] === 'string') {
    return firstValue[0];
  }

  if (typeof firstValue === 'string') {
    return firstValue;
  }

  return fallback;
};
