import { Outlet } from '@tanstack/react-router'
import { Container } from '@mantine/core'

export default function PublicLayout() {
  return (
    <Container size="xs" pt="xl">
      <Outlet />
    </Container>
  )
}
