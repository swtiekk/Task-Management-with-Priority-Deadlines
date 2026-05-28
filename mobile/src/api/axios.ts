import axios from 'axios';
import { NativeModules, Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const LAN_BACKEND_HOST = '192.168.254.120';

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

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `JWT ${token}`;
  } else {
    delete config.headers.Authorization;
  }
  return config;
});

export default api;
