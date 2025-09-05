import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider } from '@mantine/core'
import { initAuth, queryClient } from './api'
import { router } from './routes'


if (import.meta.env.DEV) {
  // Verify env variables at runtime (dev only)
  // Note: Vite injects env vars prefixed with VITE_
  // eslint-disable-next-line no-console
  console.info('Runtime env', {
    MODE: import.meta.env.MODE,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL,
    VITE_KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM,
    VITE_KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  })
}

async function start() {
  await initAuth()
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MantineProvider>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>
  )
}

start()
