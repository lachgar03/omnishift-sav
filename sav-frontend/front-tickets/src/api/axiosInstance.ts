import axios from 'axios'
import type { AxiosError, AxiosRequestConfig } from 'axios'
import { getToken, refreshToken, logout } from './authConfig'
import type { ErrorResponse } from '@/types'

const baseURL = import.meta.env.VITE_API_URL || 'http://localhost:8081/api'

export const axiosInstance = axios.create({ baseURL })

import type { InternalAxiosRequestConfig } from 'axios'

axiosInstance.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getToken()

  // Set default headers according to backend guide
  config.headers = config.headers || {}

  // Set standard headers
  const headers = config.headers as Record<string, string>
  headers['Content-Type'] = 'application/json'
  headers['Accept'] = 'application/json'
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean }
    const status = error.response?.status

    // Handle authentication errors
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
              'Content-Type': 'application/json',
              Accept: 'application/json',
            }
          }
          return axiosInstance(originalRequest)
        }
      } catch {
        // fallthrough to logout
      }
      await logout()
    }

    // Parse error response and provide structured error handling
    const errorResponse = error.response?.data as ErrorResponse | undefined

    // Create enhanced error with structured information
    const enhancedError = {
      ...error,
      parsedError: errorResponse,
      status,
      message: errorResponse?.message || error.message,
    }

    // Log different error types for debugging with structured data
    if (status === 400) {
      console.warn('Bad Request:', errorResponse || error.response?.data)
    } else if (status === 403) {
      console.warn('Forbidden - Insufficient permissions:', errorResponse || error.response?.data)
    } else if (status === 404) {
      console.warn('Resource not found:', errorResponse || error.response?.data)
    } else if (status === 422) {
      console.warn('Validation errors:', errorResponse || error.response?.data)
    } else if (status === 500) {
      console.error('Server error:', errorResponse || error.response?.data)
    }

    return Promise.reject(enhancedError)
  },
)

export interface ApiResponse<DataType> {
  data: DataType
  message?: string
  errors?: unknown
}
