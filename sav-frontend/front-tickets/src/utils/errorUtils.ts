import type { AxiosError } from 'axios'
import type { ErrorResponse } from '@/types'

export interface EnhancedError extends AxiosError {
  parsedError?: ErrorResponse
  status?: number
  message: string
}

/**
 * Extract user-friendly error message from API error response
 */
export function getErrorMessage(error: unknown): string {
  if (isEnhancedError(error)) {
    // Use parsed error message if available
    if (error.parsedError?.message) {
      return error.parsedError.message
    }

    // Fall back to status-based messages
    switch (error.status) {
      case 400:
        return 'Invalid request. Please check your input and try again.'
      case 401:
        return 'Authentication required. Please log in.'
      case 403:
        return 'You do not have permission to perform this action.'
      case 404:
        return 'The requested resource was not found.'
      case 422:
        return 'Validation failed. Please check your input.'
      case 500:
        return 'An internal server error occurred. Please try again later.'
      default:
        return error.message || 'An unexpected error occurred.'
    }
  }

  if (error instanceof Error) {
    return error.message
  }

  return 'An unexpected error occurred.'
}

/**
 * Check if error is an enhanced error with parsed response
 */
export function isEnhancedError(error: unknown): error is EnhancedError {
  return typeof error === 'object' && error !== null && 'parsedError' in error && 'status' in error
}

/**
 * Extract validation errors from error response
 */
export function getValidationErrors(error: unknown): Record<string, string> | null {
  if (isEnhancedError(error) && error.status === 422) {
    const errorResponse = error.parsedError
    if (errorResponse && typeof errorResponse === 'object' && 'errors' in errorResponse) {
      return errorResponse.errors as Record<string, string>
    }
  }
  return null
}

/**
 * Check if error indicates authentication failure
 */
export function isAuthError(error: unknown): boolean {
  return isEnhancedError(error) && (error.status === 401 || error.status === 403)
}

/**
 * Check if error indicates a network/server issue
 */
export function isServerError(error: unknown): boolean {
  return isEnhancedError(error) && (error.status === undefined || error.status >= 500)
}
