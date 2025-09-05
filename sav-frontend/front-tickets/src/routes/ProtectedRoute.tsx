import { Navigate } from '@tanstack/react-router'
import { useAuthStore } from '@store/authStore'
import type { JSX } from 'react'

type Props = {
  children: JSX.Element
}

export default function ProtectedRoute({ children }: Props) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  if (!isAuthenticated) {
    return <Navigate to="/login" />
  }
  return children
}
