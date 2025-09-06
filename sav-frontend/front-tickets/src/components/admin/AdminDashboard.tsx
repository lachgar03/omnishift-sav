import { useQuery } from '@tanstack/react-query'
import { Container, Title, Grid, Card, Text, Group, Badge, Button, Stack, Loader, Alert } from '@mantine/core'
import { ticketsApi, usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import type { TicketStatsResponse, UserStatsResponse } from '@/types'

export default function AdminDashboard() {
  const {
    data: ticketStats,
    isLoading: isLoadingTickets,
    error: ticketError,
  } = useQuery<TicketStatsResponse>({
    queryKey: ['admin', 'ticket-stats'],
    queryFn: () => ticketsApi.getStatistics(),
  })

  const {
    data: userStats,
    isLoading: isLoadingUsers,
    error: userError,
  } = useQuery<UserStatsResponse>({
    queryKey: ['admin', 'user-stats'],
    queryFn: () => usersApi.getStatistics(),
  })

  if (isLoadingTickets || isLoadingUsers) {
    return (
      <Container size="xl" py="md">
        <Title order={1} mb="xl">Admin Dashboard</Title>
        <Group justify="center" mt="xl">
          <Loader size="lg" />
          <Text>Loading dashboard data...</Text>
        </Group>
      </Container>
    )
  }

  if (ticketError || userError) {
    return (
      <Container size="xl" py="md">
        <Title order={1} mb="xl">Admin Dashboard</Title>
        <Alert color="red" title="Error">
          Error loading dashboard: {getErrorMessage(ticketError || userError)}
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      <Title order={1} mb="xl">Admin Dashboard</Title>

      <Grid>
        {/* Ticket Statistics */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <Text size="xl">🎫</Text>
              <Title order={3}>Ticket Statistics</Title>
            </Group>
            {ticketStats && (
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text>Total Tickets</Text>
                  <Badge color="blue" size="lg">{ticketStats.totalTickets}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text>Open Tickets</Text>
                  <Badge color="yellow" size="lg">{ticketStats.openTickets}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text>In Progress</Text>
                  <Badge color="orange" size="lg">{ticketStats.inProgressTickets}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text>Assigned</Text>
                  <Badge color="cyan" size="lg">{ticketStats.assignedTickets}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text>Closed</Text>
                  <Badge color="green" size="lg">{ticketStats.closedTickets}</Badge>
                </Group>
              </Stack>
            )}
          </Card>
        </Grid.Col>

        {/* User Statistics */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <Text size="xl">👥</Text>
              <Title order={3}>User Statistics</Title>
            </Group>
            {userStats && (
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text>Total Users</Text>
                  <Badge color="blue" size="lg">{userStats.totalUsers}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text>Active Users</Text>
                  <Badge color="green" size="lg">{userStats.activeUsers}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text>Technicians</Text>
                  <Badge color="purple" size="lg">{userStats.technicians}</Badge>
                </Group>
                <Group justify="space-between">
                  <Text>Admins</Text>
                  <Badge color="red" size="lg">{userStats.admins}</Badge>
                </Group>
              </Stack>
            )}
          </Card>
        </Grid.Col>

        {/* Quick Actions */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <Text size="xl">⚙️</Text>
              <Title order={3}>Quick Actions</Title>
            </Group>
            <Stack gap="sm">
              <Button 
                fullWidth 
                onClick={() => (window.location.href = '/admin/users')}
              >
                👥 Manage Users
              </Button>
              <Button 
                fullWidth 
                variant="light"
                onClick={() => (window.location.href = '/workflow')}
              >
                🎫 View Tickets
              </Button>
              <Button 
                fullWidth 
                variant="outline"
                onClick={() => (window.location.href = '/admin/statistics')}
              >
                📊 View Statistics
              </Button>
            </Stack>
          </Card>
        </Grid.Col>

        {/* System Health */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card shadow="sm" padding="lg" radius="md" withBorder>
            <Group mb="md">
              <Text size="xl">✅</Text>
              <Title order={3}>System Status</Title>
            </Group>
            <Stack gap="sm">
              <Group>
                <Badge color="green">✅ Online</Badge>
                <Text size="sm">Backend Service</Text>
              </Group>
              <Group>
                <Badge color="green">✅ Active</Badge>
                <Text size="sm">Authentication</Text>
              </Group>
              <Group>
                <Badge color="green">✅ Connected</Badge>
                <Text size="sm">Database</Text>
              </Group>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
