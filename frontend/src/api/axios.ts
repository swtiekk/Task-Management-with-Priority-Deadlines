import axios from 'axios'

const api = axios.create({
  baseURL: 'https://task-management-with-priority-deadlines-production.up.railway.app/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `JWT ${token}`
  } else {
    delete config.headers.Authorization
  }
  return config
})

export default api