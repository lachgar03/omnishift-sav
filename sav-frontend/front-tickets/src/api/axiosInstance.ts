import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { getToken, refreshToken, logout } from './authConfig'

// Route API requests through the gateway. Prefer env var but default to gateway on 8081
const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'

export const axiosInstance = axios.create({ baseURL })

import type { InternalAxiosRequestConfig } from 'axios'

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken()
  if (token) {
    config.headers = config.headers || {}
    // For Axios v1+, headers may be AxiosHeaders instance or plain object
    // Use set if available, else fallback to object assignment
    if (typeof (config.headers as any).set === 'function') {
      (config.headers as any).set('Authorization', `Bearer ${token}`)
    } else {
      (config.headers as Record<string, string>)['Authorization'] = `Bearer ${token}`
    }
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        const refreshed = await refreshToken()
        if (refreshed) {
          const token = await getToken()
          if (token) {
            originalRequest.headers = {
              ...(originalRequest.headers || {}),
              Authorization: `Bearer ${token}`,
            }
          }
          return axiosInstance(originalRequest)
        }
      } catch {
        // fallthrough to logout
      }
      await logout()
    }

    return Promise.reject(error)
  },
)

export interface ApiResponse<DataType> {
  data: DataType
  message?: string
  errors?: unknown
}
