import React, { createContext, useContext, useState, useEffect } from 'react'
import type { KeycloakUserInfo } from '@/types/api'

// Mock Keycloak implementation until proper integration is added
const mockKeycloak = {
  token: 'mock-token',
  subject: 'mock-user-id',
  realmAccess: { roles: ['USER'] },
  login: () => console.log('Mock login'),
  logout: () => console.log('Mock logout'),
  loadUserInfo: async (): Promise<KeycloakUserInfo> => ({
    sub: 'mock-user-id',
    preferred_username: 'mockuser',
    email: 'mock@example.com',
    given_name: 'Mock',
    family_name: 'User',
    name: 'Mock User',
  }),
  updateToken: async (): Promise<boolean> => true,
}

const initKeycloak = async (): Promise<boolean> => {
  // Mock initialization - always return true for development
  return Promise.resolve(true)
}

interface User {
  id: string
  username: string
  email: string
  firstName: string
  lastName: string
  roles: string[]
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: () => void
  logout: () => void
  refreshToken: () => Promise<string>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      try {
        const authenticated = await initKeycloak()
        setIsAuthenticated(authenticated)

        if (authenticated && mockKeycloak.token) {
          const userInfo = await mockKeycloak.loadUserInfo()
          setUser({
            id: mockKeycloak.subject || '',
            username: userInfo.preferred_username || '',
            email: userInfo.email || '',
            firstName: userInfo.given_name || '',
            lastName: userInfo.family_name || '',
            roles: mockKeycloak.realmAccess?.roles || [],
          })
        }
      } catch (error) {
        console.error('Authentication initialization failed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    initAuth()
  }, [])

  const login = () => {
    mockKeycloak.login()
  }

  const logout = () => {
    mockKeycloak.logout()
  }

  const refreshToken = async (): Promise<string> => {
    try {
      const refreshed = await mockKeycloak.updateToken()
      if (refreshed) {
        return mockKeycloak.token || ''
      }
      return mockKeycloak.token || ''
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
