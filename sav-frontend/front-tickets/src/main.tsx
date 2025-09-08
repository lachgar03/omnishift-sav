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
  
  // Add custom CSS for sidebar styling
  const style = document.createElement('style')
  style.textContent = `
    .sidebar-navbar {
      cursor: default !important;
    }
    .sidebar-navbar * {
      cursor: pointer !important;
    }
    .sidebar-navbar ::selection {
      background-color: rgba(255, 255, 255, 0.3) !important;
      color: white !important;
    }
    .sidebar-navbar ::-moz-selection {
      background-color: rgba(255, 255, 255, 0.3) !important;
      color: white !important;
    }
    .sidebar-navbar .mantine-NavLink-root {
      width: 100% !important;
      max-width: 100% !important;
      border-radius: 6px !important;
      margin-bottom: 2px !important;
      padding: 8px 12px !important;
      display: flex !important;
      align-items: center !important;
      box-sizing: border-box !important;
    }
    .sidebar-navbar .mantine-NavLink-root > div {
      width: 100% !important;
      display: flex !important;
      align-items: center !important;
    }
    .sidebar-navbar .mantine-NavLink-root:hover {
      background-color: rgba(255, 255, 255, 0.15) !important;
      transform: translateX(2px) !important;
      transition: all 0.2s ease !important;
    }
    .sidebar-navbar .mantine-NavLink-root[data-active="true"] {
      background-color: rgba(255, 255, 255, 0.25) !important;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
    }
    .sidebar-navbar .mantine-NavLink-root .mantine-NavLink-label {
      flex: 1 !important;
      width: 100% !important;
    }
    .sidebar-navbar .mantine-NavLink-root .mantine-NavLink-leftSection {
      margin-right: 8px !important;
    }
    .sidebar-navbar .mantine-Stack-root {
      height: 100% !important;
      width: 100% !important;
    }
    .sidebar-navbar .mantine-Stack-root > div {
      width: 100% !important;
    }
    .sidebar-navbar .mantine-Stack-root > div > div {
      width: 100% !important;
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
