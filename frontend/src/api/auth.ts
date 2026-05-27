import api from './axios'

export const clearSession = () => {
  localStorage.clear()
  sessionStorage.clear()
  delete api.defaults.headers.common.Authorization
}

export const storeSession = (token: string, user: unknown, refreshToken?: string) => {
  clearSession()
  localStorage.setItem('token', token)
  if (refreshToken) {
    localStorage.setItem('refresh', refreshToken)
  }
  localStorage.setItem('user', JSON.stringify(user))
  api.defaults.headers.common.Authorization = `JWT ${token}`
}
