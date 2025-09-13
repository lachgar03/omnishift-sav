import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import TicketDetail from '@routes/TicketDetail'

export const Route = createFileRoute('/tickets/$id')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: TicketDetail,
})
