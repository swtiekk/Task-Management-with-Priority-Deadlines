import axios from 'axios';
import { NativeModules, Platform } from 'react-native';

const LAN_BACKEND_HOST = '192.168.100.11';

const extractHost = (url?: string | null) => {
  if (!url) {
    return null;
  }

  const match = url.match(/^[a-z]+:\/\/([^/:]+)(?::\d+)?/i);
  return match?.[1] ?? null;
};

const getDevHost = () => {
  const scriptURL: string | undefined = NativeModules?.SourceCode?.scriptURL;
  return extractHost(scriptURL);
};

const getBaseURL = () => {
  const devHost = getDevHost();

  if (devHost && devHost !== 'localhost' && devHost !== '127.0.0.1') {
    return `http://${devHost}:8000/api`;
  }

  if (Platform.OS === 'android') {
    return `http://${LAN_BACKEND_HOST}:8000/api`;
  }

  return `http://${LAN_BACKEND_HOST}:8000/api`;
};

const api = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
