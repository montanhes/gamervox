import axios from 'axios'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  withXSRFToken: true,
  headers: {
    Accept: 'application/json',
  },
})

let csrfReady: Promise<unknown> | null = null

api.interceptors.request.use(async (config) => {
  const method = config.method?.toLowerCase()
  if (method && method !== 'get') {
    csrfReady ??= api.get('/sanctum/csrf-cookie')
    await csrfReady
  }
  return config
})
