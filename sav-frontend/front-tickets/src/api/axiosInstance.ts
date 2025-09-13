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

  // Proactive user sync for critical endpoints (with circuit breaker)
  if (config.url && (config.url.includes('/tickets') || config.url.includes('/users/me'))) {
    // Check if we've already tried user sync recently to prevent infinite loops
    const lastSyncAttempt = sessionStorage.getItem('lastUserSyncAttempt')
    const now = Date.now()
    const syncCooldown = 30000 // 30 seconds cooldown

    if (!lastSyncAttempt || now - parseInt(lastSyncAttempt) > syncCooldown) {
      try {
        // Check if user exists and sync if needed
        const { usersApi } = await import('./users')
        const exists = await usersApi.checkExists()
        if (!exists.exists) {
          console.log('User not found, proactively syncing...')
          sessionStorage.setItem('lastUserSyncAttempt', now.toString())

          try {
            await usersApi.forceSync()
            console.log('Proactive user sync successful')
          } catch {
            console.warn('Force sync failed, trying minimal user creation...')
            try {
              await usersApi.createMinimal()
              console.log('Minimal user creation successful')
            } catch (minimalError) {
              console.warn('Minimal user creation also failed:', minimalError)
              // Don't retry again for a while
            }
          }
        }
      } catch (syncError) {
        console.warn('Proactive user sync failed:', syncError)
        // Continue with request - will be handled by response interceptor
      }
    } else {
      console.log('User sync cooldown active, skipping proactive sync')
    }
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

    // Handle 400 errors from user sync endpoints specifically
    if (status === 400 && originalRequest.url && originalRequest.url.includes('/users/sync')) {
      console.warn(
        'User sync endpoint returned 400, stopping retry attempts to prevent infinite loop',
      )
      // Don't try any more user sync attempts - just return the error
      return Promise.reject(enhancedError)
    }

    // Handle user not found errors (400/404 with user-related messages)
    if (
      (status === 400 || status === 404) &&
      errorResponse?.message?.includes('user') &&
      errorResponse?.message?.includes('not found')
    ) {
      console.warn('User not found, attempting to sync user...')
      try {
        // Import usersApi dynamically to avoid circular dependency
        const { usersApi } = await import('./users')
        try {
          await usersApi.forceSync()
          console.log('User sync successful, retrying request...')
          return axiosInstance(originalRequest)
        } catch {
          console.warn('Force sync failed, trying minimal user creation...')
          try {
            await usersApi.createMinimal()
            console.log('Minimal user creation successful, retrying request...')
            return axiosInstance(originalRequest)
          } catch (minimalError) {
            console.error('Both force sync and minimal user creation failed:', minimalError)
            // Continue with original error
          }
        }
      } catch (syncError) {
        console.error('Failed to sync user:', syncError)
        // Continue with original error
      }
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
