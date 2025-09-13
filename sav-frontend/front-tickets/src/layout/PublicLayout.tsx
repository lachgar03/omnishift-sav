import { Outlet } from '@tanstack/react-router'
import { Container, Box } from '@mantine/core'

export default function PublicLayout() {
  console.log('PublicLayout rendering')
  return (
    <Box style={{ minHeight: '100vh', width: '100%' }}>
      <Container size="xs" pt="xl">
        <Outlet />
      </Container>
    </Box>
  )
}
