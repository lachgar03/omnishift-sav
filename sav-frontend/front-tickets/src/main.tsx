import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { MantineProvider, createTheme } from '@mantine/core'
import '@mantine/core/styles.css'
import { initAuth, queryClient } from './api'
import { router } from './routes'

if (import.meta.env.DEV) {
  // Verify env variables at runtime (dev only)
  // Note: Vite injects env vars prefixed with VITE_

  console.info('Runtime env', {
    MODE: import.meta.env.MODE,
    VITE_API_URL: import.meta.env.VITE_API_URL,
    VITE_KEYCLOAK_URL: import.meta.env.VITE_KEYCLOAK_URL,
    VITE_KEYCLOAK_REALM: import.meta.env.VITE_KEYCLOAK_REALM,
    VITE_KEYCLOAK_CLIENT_ID: import.meta.env.VITE_KEYCLOAK_CLIENT_ID,
  })
}

// Create Mantine theme
const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
})

async function start() {
  await initAuth()
  
  // Add custom CSS for sidebar selection
  const style = document.createElement('style')
  style.textContent = `
    .sidebar-navbar ::selection {
      background-color: rgba(255, 255, 255, 0.3) !important;
      color: white !important;
    }
    .sidebar-navbar ::-moz-selection {
      background-color: rgba(255, 255, 255, 0.3) !important;
      color: white !important;
    }
  `
  document.head.appendChild(style)
  
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <MantineProvider theme={theme}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </MantineProvider>
    </StrictMode>,
  )
}

start()
