import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { UserRole, type AuthUser } from '@/types'

interface AuthState {
  user: AuthUser | null
  token: string | null
  isAuthenticated: boolean
  isAdmin: boolean
  isTechnician: boolean
  isUser: boolean
  setAuth: (user: AuthUser, token: string) => void
  clearAuth: () => void
  // Add aliases for compatibility with authConfig
  login: (payload: { accessToken: string; roles: UserRole[]; user?: AuthUser }) => void
  logout: () => void
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isTechnician: false,
      isUser: false,

      setAuth: (user: AuthUser, token: string) => {
        set({ 
          user, 
          token, 
          isAuthenticated: true,
          isAdmin: user.roles?.includes(UserRole.ADMIN) ?? false,
          isTechnician: user.roles?.includes(UserRole.TECHNICIAN) ?? false,
          isUser: user.roles?.includes(UserRole.USER) ?? false
        })
      },

      clearAuth: () => {
        set({ 
          user: null, 
          token: null, 
          isAuthenticated: false,
          isAdmin: false,
          isTechnician: false,
          isUser: false
        })
      },

      // Aliases for compatibility
      login: ({ accessToken, roles, user }) => {
        const authUser: AuthUser = user || {
          id: '',
          username: '',
          roles: roles
        }
        get().setAuth(authUser, accessToken)
      },

      logout: () => {
        get().clearAuth()
      },

      hasRole: (role: UserRole) => {
        const { user } = get()
        return user?.roles?.includes(role) ?? false
      },

      hasAnyRole: (roles: UserRole[]) => {
        const { user } = get()
        return roles.some(role => user?.roles?.includes(role)) ?? false
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)