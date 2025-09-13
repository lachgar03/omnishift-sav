import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/constants/roles'
import AssignedTickets from '@/components/workflow/AssignedTickets'

export const Route = createFileRoute('/workflow/assigned')({
  beforeLoad: () => {
    const { isAuthenticated, hasAnyRole } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    if (!hasAnyRole([UserRole.TECHNICIAN, UserRole.ADMIN])) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AssignedTickets,
})
