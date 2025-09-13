import { useQuery } from '@tanstack/react-query'
import {
  Title,
  Text,
  Group,
  Badge,
  Stack,
  Loader,
  Alert,
  Flex,
  Box,
  Progress,
  SimpleGrid,
  Paper,
  Divider,
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
      <Flex direction="column" h="100%" justify="center" align="center">
        <Title order={1} mb="xl">
          System Statistics
        </Title>
        <Group>
          <Loader size="lg" />
          <Text>Loading statistics...</Text>
        </Group>
      </Flex>
    )
  }

  if (ticketError || userError) {
    return (
      <Flex direction="column" h="100%">
        <Title order={1} mb="xl">
          System Statistics
        </Title>
        <Alert color="red" title="Error">
          Error loading statistics: {getErrorMessage(ticketError || userError)}
        </Alert>
      </Flex>
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
    <Flex direction="column" h="100%">
      <Title order={1} mb="xl">
        System Statistics
      </Title>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" style={{ flex: 1 }}>
        {/* Ticket Overview */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Title order={3}>Ticket Overview</Title>
            {ticketStats && (
              <SimpleGrid cols={2} spacing="sm">
                <Group justify="space-between">
                  <Text size="sm">Total Tickets</Text>
                  <Badge color="blue" size="lg">
                    {ticketStats.totalTickets}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Resolved</Text>
                  <Badge color="green" size="lg">
                    {ticketStats.closedTickets}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">In Progress</Text>
                  <Badge color="yellow" size="lg">
                    {ticketStats.inProgressTickets}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Open</Text>
                  <Badge color="red" size="lg">
                    {ticketStats.openTickets}
                  </Badge>
                </Group>
              </SimpleGrid>
            )}
            {ticketStats && (
              <Box>
                <Text size="sm" c="dimmed" mb="xs">
                  Resolution Rate: {calculateTicketResolutionRate()}%
                </Text>
                <Progress
                  value={calculateTicketResolutionRate()}
                  color="blue"
                  size="sm"
                  radius="md"
                />
              </Box>
            )}
          </Stack>
        </Paper>

        {/* User Overview */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Title order={3}>User Overview</Title>
            {userStats && (
              <SimpleGrid cols={2} spacing="sm">
                <Group justify="space-between">
                  <Text size="sm">Total Users</Text>
                  <Badge color="blue" size="lg">
                    {userStats.totalUsers}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Active</Text>
                  <Badge color="green" size="lg">
                    {userStats.activeUsers}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Technicians</Text>
                  <Badge color="purple" size="lg">
                    {userStats.technicians}
                  </Badge>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Admins</Text>
                  <Badge color="red" size="lg">
                    {userStats.admins}
                  </Badge>
                </Group>
              </SimpleGrid>
            )}
            {userStats && (
              <Box>
                <Text size="sm" c="dimmed" mb="xs">
                  Activity Rate: {calculateUserActivityRate()}%
                </Text>
                <Progress value={calculateUserActivityRate()} color="green" size="sm" radius="md" />
              </Box>
            )}
          </Stack>
        </Paper>

        {/* High Priority Tickets */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Title order={3}>High Priority Tickets</Title>
            <SimpleGrid cols={1} spacing="sm">
              <Group justify="space-between">
                <Text size="sm">Critical Priority</Text>
                <Badge color="red" size="lg">
                  {criticalTickets?.length || 0}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">High Priority</Text>
                <Badge color="orange" size="lg">
                  {highPriorityTickets?.length || 0}
                </Badge>
              </Group>
              <Group justify="space-between">
                <Text size="sm">Assigned Tickets</Text>
                <Badge color="blue" size="lg">
                  {ticketStats?.assignedTickets || 0}
                </Badge>
              </Group>
            </SimpleGrid>
          </Stack>
        </Paper>

        {/* System Health */}
        <Paper withBorder p="md" radius="md">
          <Stack gap="md">
            <Title order={3}>System Health</Title>
            <Stack gap="sm">
              <Group>
                <Badge color="green" size="sm">
                  Operational
                </Badge>
                <Text size="sm">Backend Service</Text>
              </Group>
              <Group>
                <Badge color="green" size="sm">
                  Active
                </Badge>
                <Text size="sm">Authentication</Text>
              </Group>
              <Group>
                <Badge color="green" size="sm">
                  Connected
                </Badge>
                <Text size="sm">Database</Text>
              </Group>
              <Divider />
              <Group>
                <Badge color="blue" size="sm">
                  {pendingUsers?.length || 0} awaiting
                </Badge>
                <Text size="sm">Pending Users</Text>
              </Group>
            </Stack>
          </Stack>
        </Paper>
      </SimpleGrid>
    </Flex>
  )
}
