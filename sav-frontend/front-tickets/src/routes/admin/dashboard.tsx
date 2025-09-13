import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/constants/roles'
import AdminDashboard from '@/components/admin/AdminDashboard'

export const Route = createFileRoute('/admin/dashboard')({
  beforeLoad: () => {
    const { isAuthenticated, hasRole } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    if (!hasRole(UserRole.ADMIN)) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminDashboard,
})
