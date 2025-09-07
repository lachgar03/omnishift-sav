import { useQuery } from '@tanstack/react-query'
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Stack,
  Loader,
  Alert,
} from '@mantine/core'
import { ticketsApi, usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { Priority, UserStatus } from '@/constants/roles'
import type { TicketStatsResponse, UserStatsResponse, UserResponse, TicketResponse } from '@/types'

export default function SystemStatistics() {
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

  // Additional queries for detailed breakdown
  const { data: highPriorityTickets } = useQuery<TicketResponse[]>({
    queryKey: ['admin', 'high-priority-tickets'],
    queryFn: () => ticketsApi.getByPriority(Priority.HIGH),
  })

  const { data: criticalTickets } = useQuery<TicketResponse[]>({
    queryKey: ['admin', 'critical-tickets'],
    queryFn: () => ticketsApi.getByPriority(Priority.CRITICAL),
  })

  const { data: pendingUsers } = useQuery<UserResponse[]>({
    queryKey: ['admin', 'pending-users'],
    queryFn: () => usersApi.getByStatus(UserStatus.PENDING_ACTIVATION),
  })

  if (isLoadingTickets || isLoadingUsers) {
    return (
      <Container size="xl" py="md">
        <Title order={1} mb="xl">
          System Statistics
        </Title>
        <Group justify="center" mt="xl">
          <Loader size="lg" />
          <Text>Loading statistics...</Text>
        </Group>
      </Container>
    )
  }

  if (ticketError || userError) {
    return (
      <Container size="xl" py="md">
        <Title order={1} mb="xl">
          System Statistics
        </Title>
        <Alert color="red" title="Error">
          Error loading statistics: {getErrorMessage(ticketError || userError)}
        </Alert>
      </Container>
    )
  }

  const calculateTicketResolutionRate = () => {
    if (!ticketStats) return 0
    const total = ticketStats.totalTickets
    if (total === 0) return 0
    return Math.round((ticketStats.closedTickets / total) * 100)
  }

  const calculateUserActivityRate = () => {
    if (!userStats) return 0
    const total = userStats.totalUsers
    if (total === 0) return 0
    return Math.round((userStats.activeUsers / total) * 100)
  }

  return (
    <Container size="xl" py="md">
      <Title order={1} mb="xl">
        System Statistics
      </Title>

      <Grid>
        {/* Ticket Overview */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Ticket Overview</Title>
              {ticketStats && (
                <Grid>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text>Total Tickets</Text>
                      <Badge color="blue" size="lg">
                        {ticketStats.totalTickets}
                      </Badge>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text>Resolved</Text>
                      <Badge color="green" size="lg">
                        {ticketStats.closedTickets}
                      </Badge>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text>In Progress</Text>
                      <Badge color="yellow" size="lg">
                        {ticketStats.inProgressTickets}
                      </Badge>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text>Open</Text>
                      <Badge color="red" size="lg">
                        {ticketStats.openTickets}
                      </Badge>
                    </Group>
                  </Grid.Col>
                </Grid>
              )}
              <Alert color="blue" variant="light">
                <Text fw={500}>Resolution Rate: {calculateTicketResolutionRate()}%</Text>
              </Alert>
            </Stack>
          </Card>
        </Grid.Col>

        {/* User Overview */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>User Overview</Title>
              {userStats && (
                <Grid>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text>Total Users</Text>
                      <Badge color="blue" size="lg">
                        {userStats.totalUsers}
                      </Badge>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text>Active</Text>
                      <Badge color="green" size="lg">
                        {userStats.activeUsers}
                      </Badge>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text>Technicians</Text>
                      <Badge color="cyan" size="lg">
                        {userStats.technicians}
                      </Badge>
                    </Group>
                  </Grid.Col>
                  <Grid.Col span={6}>
                    <Group justify="space-between">
                      <Text>Admins</Text>
                      <Badge color="gray" size="lg">
                        {userStats.admins}
                      </Badge>
                    </Group>
                  </Grid.Col>
                </Grid>
              )}
              <Alert color="blue" variant="light">
                <Text fw={500}>Activity Rate: {calculateUserActivityRate()}%</Text>
              </Alert>
            </Stack>
          </Card>
        </Grid.Col>

        {/* Priority Breakdown */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>High Priority Tickets</Title>
              <Stack gap="sm">
                <Group justify="space-between">
                  <Text c="red" fw={500}>
                    Critical Priority
                  </Text>
                  <Badge color="red" size="lg">
                    {criticalTickets?.length || 0}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text c="orange" fw={500}>
                    High Priority
                  </Text>
                  <Badge color="orange" size="lg">
                    {highPriorityTickets?.length || 0}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text c="yellow" fw={500}>
                    Assigned Tickets
                  </Text>
                  <Badge color="yellow" size="lg">
                    {ticketStats?.assignedTickets || 0}
                  </Badge>
                </Group>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>

        {/* System Health */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>System Health</Title>
              <Stack gap="sm">
                <Group>
                  <Badge color="green" variant="dot" />
                  <div>
                    <Text fw={500}>Backend Service</Text>
                    <Text size="sm" c="dimmed">
                      Operational
                    </Text>
                  </div>
                </Group>
                <Group>
                  <Badge color="green" variant="dot" />
                  <div>
                    <Text fw={500}>Authentication</Text>
                    <Text size="sm" c="dimmed">
                      Active
                    </Text>
                  </div>
                </Group>
                <Group>
                  <Badge
                    color={pendingUsers && pendingUsers.length > 0 ? 'yellow' : 'green'}
                    variant="dot"
                  />
                  <div>
                    <Text fw={500}>Pending Users</Text>
                    <Text size="sm" c="dimmed">
                      {pendingUsers?.length || 0} awaiting activation
                    </Text>
                  </div>
                </Group>
              </Stack>
            </Stack>
          </Card>
        </Grid.Col>
      </Grid>
    </Container>
  )
}
