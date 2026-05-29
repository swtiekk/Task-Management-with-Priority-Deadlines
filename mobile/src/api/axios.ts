import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const getBaseURL = () => {
  return 'https://task-management-with-priority-deadlines-production.up.railway.app/api';
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