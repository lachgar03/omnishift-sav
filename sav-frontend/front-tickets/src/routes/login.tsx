import { createFileRoute } from '@tanstack/react-router'
import LoginPage from '@routes/auth/LoginPage'

export const Route = createFileRoute('/login')({
  component: LoginPage,
})
