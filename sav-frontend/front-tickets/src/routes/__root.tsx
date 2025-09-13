import { createRootRoute, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'
import { MantineProvider, createTheme } from '@mantine/core'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '../styles/sidebar.css'

const theme = createTheme({
  primaryColor: 'blue',
  defaultRadius: 'md',
})

export const Route = createRootRoute({
  component: () => (
    <MantineProvider theme={theme}>
      <Notifications />
      <Outlet />
      <TanStackRouterDevtools />
    </MantineProvider>
  ),
  notFoundComponent: () => (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        textAlign: 'center',
        padding: '2rem',
      }}
    >
      <h1>404 - Page Not Found</h1>
      <p>The page you're looking for doesn't exist.</p>
      <button onClick={() => (window.location.href = '/')}>Go Home</button>
    </div>
  ),
})
