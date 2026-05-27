import * as SecureStore from 'expo-secure-store';
import api from './axios';

export const clearSession = async () => {
  await SecureStore.deleteItemAsync('token');
  await SecureStore.deleteItemAsync('refresh');
  await SecureStore.deleteItemAsync('user');
  await SecureStore.deleteItemAsync('user_profile');
  delete api.defaults.headers.common.Authorization;
};

export const storeSession = async (token: string, user: unknown, refreshToken?: string) => {
  await clearSession();
  await SecureStore.setItemAsync('token', token);
  if (refreshToken) {
    await SecureStore.setItemAsync('refresh', refreshToken);
  }
  await SecureStore.setItemAsync('user', JSON.stringify(user));
  api.defaults.headers.common.Authorization = `JWT ${token}`;
};
