import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import MyTicketsList from '@routes/MyTicketsList'

export const Route = createFileRoute('/tickets/my-tickets')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: MyTicketsList,
})
