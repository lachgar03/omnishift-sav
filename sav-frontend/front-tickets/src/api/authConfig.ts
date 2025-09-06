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

export async function initAuth(): Promise<boolean> {
  const authenticated = await keycloak.init({
    onLoad: 'login-required',
    checkLoginIframe: false,
    pkceMethod: 'S256',
  })
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

  if (!token || !parsed) return

  // Map Keycloak roles to our UserRole enum
  const keycloakRoles: string[] = Array.isArray(
    (parsed?.realm_access as { roles?: string[] })?.roles,
  )
    ? ((parsed?.realm_access as { roles?: string[] })?.roles as string[])
    : []
  const roles: UserRole[] = keycloakRoles
    .map((role) => role.toUpperCase())
    .filter((role) => Object.values(UserRole).includes(role as UserRole)) as UserRole[]

  const user: AuthUser = {
    id: String(parsed.sub ?? ''),
    username: String(parsed.preferred_username ?? ''),
    email: parsed.email ? String(parsed.email) : undefined,
    firstName: parsed.given_name ? String(parsed.given_name) : undefined,
    lastName: parsed.family_name ? String(parsed.family_name) : undefined,
    fullName: parsed.name ? String(parsed.name) : undefined,
    roles: roles,
  }

  useAuthStore.getState().setAuth(user, token)
}
