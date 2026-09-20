import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import TicketDetailPage from '@pages/TicketDetailPage'

export const Route = createFileRoute('/tickets/$id')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: TicketDetailPage,
})
