import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/constants/roles'
import HighPriorityTickets from '@/components/workflow/HighPriorityTickets'

export const Route = createFileRoute('/workflow/priority/high')({
  beforeLoad: () => {
    const { isAuthenticated, hasAnyRole } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    if (!hasAnyRole([UserRole.TECHNICIAN, UserRole.ADMIN])) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: HighPriorityTickets,
})
