import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/constants/roles'

export const Route = createFileRoute('/workflow')({
  beforeLoad: () => {
    const { isAuthenticated, hasAnyRole } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    if (!hasAnyRole([UserRole.TECHNICIAN, UserRole.ADMIN])) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: () => <div>Workflow Dashboard</div>,
})
