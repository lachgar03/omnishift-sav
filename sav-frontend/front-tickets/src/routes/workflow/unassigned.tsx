import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/constants/roles'
import UnassignedTickets from '@/components/workflow/UnassignedTickets'

export const Route = createFileRoute('/workflow/unassigned')({
  beforeLoad: () => {
    const { isAuthenticated, hasAnyRole } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    if (!hasAnyRole([UserRole.TECHNICIAN, UserRole.ADMIN])) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: UnassignedTickets,
})
