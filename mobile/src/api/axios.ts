import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

// Use the local machine's IP address if running on a physical device.
// Defaulting to 10.0.2.2 for Android Emulator, or localhost for iOS simulator.
const getBaseUrl = () => {
  const debuggerHost = Constants.expoConfig?.hostUri;
  const localhost = debuggerHost ? debuggerHost.split(':')[0] : '127.0.0.1';
  return `http://${localhost}:8000/api/v1`;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to include the JWT token in all requests
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `JWT ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
