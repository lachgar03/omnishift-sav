import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/constants/roles'
import SystemStatistics from '@/components/admin/SystemStatistics'

export const Route = createFileRoute('/admin/statistics')({
  beforeLoad: () => {
    const { isAuthenticated, hasRole } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    if (!hasRole(UserRole.ADMIN)) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: SystemStatistics,
})
