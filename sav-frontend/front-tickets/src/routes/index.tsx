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
import CreateTicketPage from '@routes/CreateTicketPage'
import { UserRole } from '@/constants/roles'
import NotFound from '@components/NotFound'
import AdminDashboard from '@/components/admin/AdminDashboard'
import AdminUserManagement from '@/components/admin/AdminUserManagement'
import SystemStatistics from '@/components/admin/SystemStatistics'
import UserList from '@/components/users/UserList'
import UserDetail from '@/components/users/UserDetail'
import TechniciansList from '@/components/users/TechniciansList'
import AssignedTickets from '@/components/workflow/AssignedTickets'
import UnassignedTickets from '@/components/workflow/UnassignedTickets'
import HighPriorityTickets from '@/components/workflow/HighPriorityTickets'
import CriticalPriorityTickets from '@/components/workflow/CriticalPriorityTickets'
import TeamTickets from '@/components/workflow/TeamTickets'

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

const createTicketRoute = createRoute({
  getParentRoute: () => privateRoute,
  path: '/tickets/create',
  component: CreateTicketPage,
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
  component: AssignedTickets,
})

const unassignedTicketsRoute = createRoute({
  getParentRoute: () => workflowRoute,
  path: '/unassigned',
  component: UnassignedTickets,
})

const highPriorityRoute = createRoute({
  getParentRoute: () => workflowRoute,
  path: '/priority/high',
  component: HighPriorityTickets,
})

const criticalPriorityRoute = createRoute({
  getParentRoute: () => workflowRoute,
  path: '/priority/critical',
  component: CriticalPriorityTickets,
})

const teamTicketsRoute = createRoute({
  getParentRoute: () => workflowRoute,
  path: '/team/$team',
  component: TeamTickets,
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
  component: UserList,
})

const userDetailRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/$id',
  component: UserDetail,
})

const userEditRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/$id/edit',
  component: () => <div>Edit User - Under Construction</div>, // TODO: Implement component
})

const techniciansRoute = createRoute({
  getParentRoute: () => usersRoute,
  path: '/technicians',
  component: TechniciansList,
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
  component: AdminDashboard,
})

const adminUsersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/users',
  component: AdminUserManagement,
})

const adminStatisticsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: '/statistics',
  component: SystemStatistics,
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
    createTicketRoute,
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
