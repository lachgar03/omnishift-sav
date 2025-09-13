import { usersApi } from '@/api/users'
import type { UserResponse, TokenInfoResponse } from '@/types'

/**
 * Utility functions for user synchronization
 */

/**
 * Force sync the current user from JWT token
 * This will create the user in the backend database if they don't exist
 */
export const forceUserSync = async (): Promise<UserResponse> => {
  try {
    console.log('Starting user sync...')
    const user = await usersApi.forceSync()
    console.log('User sync successful:', user)
    return user
  } catch (error) {
    console.error('Failed to sync user:', error)
    throw error
  }
}

/**
 * Check if the current user exists in the backend database
 */
export const checkUserExists = async (): Promise<boolean> => {
  try {
    const response = await usersApi.checkExists()
    return response.exists
  } catch (error) {
    console.error('Failed to check user existence:', error)
    return false
  }
}

/**
 * Get JWT token information for debugging
 */
export const getTokenInfo = async (): Promise<TokenInfoResponse> => {
  try {
    const tokenInfo = await usersApi.getTokenInfo()
    console.log('Token info:', tokenInfo)
    return tokenInfo
  } catch (error) {
    console.error('Failed to get token info:', error)
    throw error
  }
}

/**
 * Create a minimal user for testing purposes
 */
export const createMinimalUser = async (): Promise<UserResponse> => {
  try {
    console.log('Creating minimal user...')
    const user = await usersApi.createMinimal()
    console.log('Minimal user created:', user)
    return user
  } catch (error) {
    console.error('Failed to create minimal user:', error)
    throw error
  }
}

/**
 * Comprehensive user sync with fallback strategies
 * 1. Check if user exists
 * 2. If not, try force sync
 * 3. If that fails, try creating minimal user
 */
export const ensureUserExists = async (): Promise<UserResponse> => {
  try {
    // First, check if user exists
    const exists = await checkUserExists()
    if (exists) {
      console.log('User already exists, fetching current user...')
      return await usersApi.getCurrentUser()
    }

    // User doesn't exist, try force sync
    console.log('User does not exist, attempting force sync...')
    try {
      return await forceUserSync()
    } catch (syncError) {
      console.warn('Force sync failed, trying minimal user creation...', syncError)

      // Fallback to minimal user creation
      try {
        return await createMinimalUser()
      } catch (minimalError) {
        console.error('All user sync strategies failed:', minimalError)
        throw new Error('Failed to sync user with all available methods')
      }
    }
  } catch (error) {
    console.error('Failed to ensure user exists:', error)
    throw error
  }
}
