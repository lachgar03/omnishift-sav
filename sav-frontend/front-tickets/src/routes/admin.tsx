import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/constants/roles'

export const Route = createFileRoute('/admin')({
  beforeLoad: () => {
    const { isAuthenticated, hasRole } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    if (!hasRole(UserRole.ADMIN)) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: () => <div>Admin Dashboard</div>,
})
