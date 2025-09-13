import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import { UserRole } from '@/constants/roles'
import AdminSettingsPage from '@routes/AdminSettingsPage'

export const Route = createFileRoute('/admin/settings')({
  beforeLoad: () => {
    const { isAuthenticated, hasRole } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
    if (!hasRole(UserRole.ADMIN)) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AdminSettingsPage,
})
