import { createFileRoute, redirect } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import CreateTicketPage from '@routes/CreateTicketPage'

export const Route = createFileRoute('/tickets/create')({
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState()
    if (!isAuthenticated) {
      throw redirect({ to: '/login' })
    }
  },
  component: CreateTicketPage,
})
