import Keycloak from 'keycloak-js'
import { useAuthStore } from '@/store/authStore'
import { UserRole } from '@/constants/roles'
import type { AuthUser } from '@/types'

const keycloakConfig: Keycloak.KeycloakConfig = {
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'sav-realm',
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'sav-frontend',
}

export const keycloak = new Keycloak(keycloakConfig)

export const initKeycloak = async (): Promise<boolean> => {
  try {
    console.log('Initializing Keycloak with config:', {
      url: keycloakConfig.url,
      realm: keycloakConfig.realm,
      clientId: keycloakConfig.clientId,
    })

    // First, check if Keycloak is accessible
    try {
      const healthCheck = await fetch(`${keycloakConfig.url}/health`)
      if (!healthCheck.ok) {
        console.warn('Keycloak health check failed, but continuing with init...')
      }
    } catch (healthError) {
      console.warn('Keycloak server might not be running:', healthError)
    }

    const authenticated = await keycloak.init({
      onLoad: 'check-sso',
      silentCheckSsoRedirectUri: window.location.origin + '/silent-check-sso.html',
      pkceMethod: 'S256',
    })

    console.log('Keycloak init result:', {
      authenticated,
      token: keycloak.token ? 'present' : 'missing',
      refreshToken: keycloak.refreshToken ? 'present' : 'missing',
      tokenParsed: keycloak.tokenParsed,
    })

    if (authenticated) {
      console.log('User authenticated')
    } else {
      console.log('User not authenticated')
    }

    return authenticated
  } catch (error) {
    console.error('Keycloak initialization failed:', error)

    // In development, if Keycloak is not available, we can continue without authentication
    if (import.meta.env.DEV) {
      console.warn('Keycloak not available in development mode, continuing without authentication')
      return false
    }

    return false
  }
}

export async function initAuth(): Promise<boolean> {
  const authenticated = await initKeycloak()
  wireKeycloakEvents()
  if (authenticated) {
    syncStoreFromKeycloak()
    scheduleTokenRefresh()
  } else {
    useAuthStore.getState().clearAuth()
  }
  return authenticated
}

let refreshTimeoutId: number | undefined

function scheduleTokenRefresh() {
  clearScheduledRefresh()
  const expiresIn = (keycloak.tokenParsed?.exp || 0) * 1000 - Date.now()
  // refresh 20s before expiry
  const refreshInMs = Math.max(expiresIn - 20000, 5000)
  refreshTimeoutId = window.setTimeout(async () => {
    try {
      const refreshed = await refreshToken()
      if (refreshed) {
        syncStoreFromKeycloak()
      }
      scheduleTokenRefresh()
    } catch {
      await logout()
    }
  }, refreshInMs)
}

function clearScheduledRefresh() {
  if (refreshTimeoutId) {
    window.clearTimeout(refreshTimeoutId)
    refreshTimeoutId = undefined
  }
}

export async function login(redirectUrl?: string) {
  await keycloak.login({ redirectUri: redirectUrl })
}

export async function logout(redirectUrl?: string) {
  clearScheduledRefresh()
  useAuthStore.getState().clearAuth()
  await keycloak.logout({ redirectUri: redirectUrl })
}

export async function getToken(): Promise<string | undefined> {
  return keycloak.token
}

export async function refreshToken(): Promise<boolean> {
  try {
    // refresh if less than 30s remaining
    const refreshed = await keycloak.updateToken(30)
    if (refreshed) {
      syncStoreFromKeycloak()
    }
    return refreshed
  } catch {
    return false
  }
}

function wireKeycloakEvents() {
  keycloak.onAuthSuccess = () => {
    syncStoreFromKeycloak()
    scheduleTokenRefresh()
    // Redirect to dashboard after successful authentication
    if (window.location.pathname === '/login') {
      window.location.href = '/dashboard'
    }
  }
  keycloak.onAuthLogout = () => {
    clearScheduledRefresh()
    useAuthStore.getState().clearAuth()
  }
  keycloak.onTokenExpired = async () => {
    const ok = await refreshToken()
    if (!ok) {
      await logout()
    }
  }
}

function syncStoreFromKeycloak() {
  const token = keycloak.token
  const parsed = keycloak.tokenParsed as Record<string, unknown> | undefined

  console.log('Syncing store from Keycloak:', {
    hasToken: !!token,
    hasParsedToken: !!parsed,
    parsedToken: parsed,
  })

  if (!token || !parsed) {
    console.log('No token or parsed token available for sync')
    return
  }

  // Map Keycloak roles to our UserRole enum
  const keycloakRoles: string[] = Array.isArray(
    (parsed?.realm_access as { roles?: string[] })?.roles,
  )
    ? ((parsed?.realm_access as { roles?: string[] })?.roles as string[])
    : []

  console.log('Keycloak roles:', keycloakRoles)

  const roles: UserRole[] = keycloakRoles
    .map((role) => role.toUpperCase())
    .filter((role) => Object.values(UserRole).includes(role as UserRole)) as UserRole[]

  console.log('Mapped roles:', roles)

  const user: AuthUser = {
    id: String(parsed.sub ?? ''),
    username: String(parsed.preferred_username ?? ''),
    email: parsed.email ? String(parsed.email) : undefined,
    firstName: parsed.given_name ? String(parsed.given_name) : undefined,
    lastName: parsed.family_name ? String(parsed.family_name) : undefined,
    fullName: parsed.name ? String(parsed.name) : undefined,
    roles: roles,
  }

  console.log('Setting auth user:', user)
  useAuthStore.getState().setAuth(user, token)
}
