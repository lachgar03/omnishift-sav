import { createRootRoute, createRoute, redirect, Router } from '@tanstack/react-router'
import PublicLayout from '@layout/PublicLayout'
import PrivateLayout from '@layout/PrivateLayout'
import LoginPage from '@routes/auth/LoginPage'
import DashboardPage from '@routes/DashboardPage'
import SettingsPage from '@routes/SettingsPage'
import { useAuthStore } from '@store/authStore'
import TestForm from '@components/TestForm'
import TicketsList from '@routes/TicketsList'
import MyTicketsList from '@routes/MyTicketsList'
import TicketDetail from '@routes/TicketDetail'
import { UserRole } from '@/constants/roles'
import NotFound from '@components/NotFound'

const rootRoute = createRootRoute()

// Public routes (no authentication required)
const publicRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'public',
  component: PublicLayout,
})

const loginRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: '/login',
  component: LoginPage,
})

const testFormRoute = createRoute({
  getParentRoute: () => publicRoute,
  path: '/test-form',
  component: TestForm,
})

// Private routes (authentication required)
const privateRoute = createRoute({
  getParentRoute: () => rootRoute,
  id: 'private',
  component: PrivateLayout,
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
})

// Root redirect
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (isAuthenticated) {
      throw redirect({ to: '/dashboard' })
    }
    throw redirect({ to: '/login' })
  },
})

// Dashboard route (all authenticated users)
const dashboardRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: '/dashboard',
  component: DashboardPage,
})

// Settings route (all authenticated users)
const settingsRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: '/settings',
  component: SettingsPage,
})

// Ticket management routes
const ticketsRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: '/tickets',
  component: TicketsList,
})

const myTicketsRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: '/tickets/my-tickets',
  component: MyTicketsList,
})

const ticketDetailRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: '/tickets/$id',
  component: TicketDetail,
})

// Workflow routes (Technician/Admin only)
const workflowRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: '/workflow',
  beforeLoad: () => {
    const { hasAnyRole } = useAuthStore.getState()
    if (!hasAnyRole([UserRole.TECHNICIAN, UserRole.ADMIN])) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

const assignedTicketsRoute = createRoute({
  getParentRoute: () => workflowRoute,
  path: '/assigned',
  component: () => <div>Assigned Tickets</div>, // TODO: Implement component
})

const unassignedTicketsRoute = createRoute({
  getParentRoute: () => workflowRoute,
  path: '/unassigned',
  component: () => <div>Unassigned Tickets</div>, // TODO: Implement component
})

const highPriorityRoute = createRoute({
  getParentRoute: () => workflowRoute,
  path: '/priority/high',
  component: () => <div>High Priority Tickets</div>, // TODO: Implement component
})

const criticalPriorityRoute = createRoute({
  getParentRoute: () => workflowRoute,
  path: '/priority/critical',
  component: () => <div>Critical Priority Tickets</div>, // TODO: Implement component
})

const teamTicketsRoute = createRoute({
  getParentRoute: () => workflowRoute,
  path: '/team/$team',
  component: () => <div>Team Tickets</div>, // TODO: Implement component
})

// User management routes (Technician/Admin only)
const usersRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: '/users',
  beforeLoad: () => {
    const { hasAnyRole } = useAuthStore.getState()
    if (!hasAnyRole([UserRole.TECHNICIAN, UserRole.ADMIN])) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: () => <div>Users List</div>, // TODO: Implement component
})

const userDetailRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/$id',
  component: () => <div>User Detail</div>, // TODO: Implement component
})

const userEditRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/$id/edit',
  component: () => <div>Edit User</div>, // TODO: Implement component
})

const techniciansRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/technicians',
  component: () => <div>Available Technicians</div>, // TODO: Implement component
})

// Admin routes (Admin only)
const adminRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: '/admin',
  beforeLoad: () => {
    const { hasRole } = useAuthStore.getState()
    if (!hasRole(UserRole.ADMIN)) {
      throw redirect({ to: '/dashboard' })
    }
  },
})

const adminDashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/dashboard',
  component: () => <div>Admin Dashboard</div>, // TODO: Implement component
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/users',
  component: () => <div>Admin User Management</div>, // TODO: Implement component
})

const adminStatisticsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/statistics',
  component: () => <div>System Statistics</div>, // TODO: Implement component
})

const adminSettingsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/settings',
  component: () => <div>System Settings</div>, // TODO: Implement component
})

export const routeTree = rootRoute.addChildren([
  publicRoute.addChildren([loginRoute, testFormRoute]),
  privateRoute.addChildren([
    dashboardRoute,
    settingsRoute,
    ticketsRoute,
    myTicketsRoute,
    ticketDetailRoute,
    workflowRoute.addChildren([
      assignedTicketsRoute,
      unassignedTicketsRoute,
      highPriorityRoute,
      criticalPriorityRoute,
      teamTicketsRoute,
    ]),
    usersRoute.addChildren([userDetailRoute, userEditRoute, techniciansRoute]),
    adminRoute.addChildren([
      adminDashboardRoute,
      adminUsersRoute,
      adminStatisticsRoute,
      adminSettingsRoute,
    ]),
  ]),
  indexRoute,
])

export const router = new Router({ routeTree, defaultNotFoundComponent: NotFound })
