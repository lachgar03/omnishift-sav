// Utility to test Keycloak connectivity and configuration
export async function testKeycloakConnection() {
  const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180'
  const realm = import.meta.env.VITE_KEYCLOAK_REALM || 'sav-realm'
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'sav-frontend'

  console.log('Testing Keycloak connection...')
  console.log('Configuration:', { keycloakUrl, realm, clientId })

  try {
    // Test 1: Check if Keycloak server is running
    const healthResponse = await fetch(`${keycloakUrl}/health`)
    console.log('Keycloak health check:', healthResponse.status)

    // Test 2: Check realm configuration
    const realmConfigUrl = `${keycloakUrl}/realms/${realm}/.well-known/openid_configuration`
    const realmResponse = await fetch(realmConfigUrl)

    if (!realmResponse.ok) {
      console.error(`❌ Realm '${realm}' not found or not accessible:`, realmResponse.status)
      return false
    }

    const realmConfig = await realmResponse.json()
    console.log('✅ Realm configuration loaded:', realmConfig)

    // Test 3: Check if client exists
    const clientConfigUrl = `${keycloakUrl}/realms/${realm}/clients`
    const clientResponse = await fetch(clientConfigUrl)

    if (clientResponse.ok) {
      console.log('✅ Client endpoint accessible')
    } else {
      console.warn('⚠️ Client endpoint not accessible (might require authentication)')
    }

    return true
  } catch (error) {
    console.error('❌ Keycloak connection test failed:', error)
    return false
  }
}

// Common Keycloak configuration issues
export function checkKeycloakConfig() {
  const issues: string[] = []

  const keycloakUrl = import.meta.env.VITE_KEYCLOAK_URL
  const realm = import.meta.env.VITE_KEYCLOAK_REALM
  const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID

  if (!keycloakUrl) {
    issues.push('VITE_KEYCLOAK_URL environment variable is not set')
  }

  if (!realm) {
    issues.push('VITE_KEYCLOAK_REALM environment variable is not set')
  }

  if (!clientId) {
    issues.push('VITE_KEYCLOAK_CLIENT_ID environment variable is not set')
  }

  if (issues.length > 0) {
    console.error('Keycloak configuration issues:', issues)
    return false
  }

  console.log('✅ Keycloak configuration looks good')
  return true
}
