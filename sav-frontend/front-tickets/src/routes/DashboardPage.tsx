import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  Title,
  Text,
  Grid,
  Card,
  Group,
  Stack,
  Badge,
  ThemeIcon,
  Skeleton,
  Alert,
  Button,
  ActionIcon,
  Tooltip,
  Flex,
  Box,
} from '@mantine/core'
import {
  IconTicket,
  IconUsers,
  IconChartBar,
  IconClock,
  IconCheck,
  IconAlertTriangle,
  IconRefresh,
  IconTrendingUp,
  IconPlus,
} from '@tabler/icons-react'
import { useAuthStore } from '@store/authStore'
import { ticketsApi, usersApi } from '@/api'
import type { DashboardResponse, TicketStatsResponse, UserStatsResponse } from '@/types'
import { getStatusColor, getPriorityColor } from '@/utils/statusUtils'

export default function DashboardPage() {
  const authStore = useAuthStore()
  const navigate = useNavigate()

  // Fetch dashboard data
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    refetch: refetchDashboard,
  } = useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: ticketsApi.getDashboard,
  })

  // Fetch global statistics (Admin/Technician only)
  const { data: ticketStats, refetch: refetchTicketStats } = useQuery<TicketStatsResponse>({
    queryKey: ['ticket-stats'],
    queryFn: ticketsApi.getStatistics,
    enabled: authStore.isTechnician || authStore.isAdmin,
  })

  // Fetch user statistics (Admin only)
  const { data: userStats, refetch: refetchUserStats } = useQuery<UserStatsResponse>({
    queryKey: ['user-stats'],
    queryFn: usersApi.getStatistics,
    enabled: authStore.isAdmin,
  })

  const handleRefresh = () => {
    refetchDashboard()
    if (authStore.isTechnician || authStore.isAdmin) {
      refetchTicketStats()
    }
    if (authStore.isAdmin) {
      refetchUserStats()
    }
  }

  if (dashboardLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '1rem'
      }}>
        <Stack gap="lg" style={{ maxWidth: '100%', width: '100%' }}>
          <Skeleton height={40} />
          <Grid>
            {Array.from({ length: 6 }).map((_, i) => (
              <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Skeleton height={120} />
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      </div>
    )
  }

  const renderUserDashboard = () => (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>My Dashboard</Title>
        <Group gap="sm">
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={() => navigate({ to: '/tickets/create' })}
          >
            Create Ticket
          </Button>
          <Tooltip label="Refresh data">
            <ActionIcon variant="subtle" onClick={handleRefresh}>
              <IconRefresh size="1rem" />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Card withBorder shadow="sm" style={{ height: '100%' }}>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  My Tickets
                </Text>
                <Text size="xl" fw={700}>
                  {dashboardData?.myTicketsCount || 0}
                </Text>
              </div>
              <ThemeIcon size="lg" variant="light" color="blue">
                <IconTicket size="1.5rem" />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Card withBorder shadow="sm" style={{ height: '100%' }}>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Open Tickets
                </Text>
                <Text size="xl" fw={700}>
                  {dashboardData?.myOpenTickets || 0}
                </Text>
              </div>
              <ThemeIcon size="lg" variant="light" color="orange">
                <IconClock size="1.5rem" />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Card withBorder shadow="sm" style={{ height: '100%' }}>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  In Progress
                </Text>
                <Text size="xl" fw={700}>
                  {dashboardData?.myInProgressTickets || 0}
                </Text>
              </div>
              <ThemeIcon size="lg" variant="light" color="yellow">
                <IconTrendingUp size="1.5rem" />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {dashboardData?.recentTickets && dashboardData.recentTickets.length > 0 && (
        <Card withBorder>
          <Stack gap="md">
            <Title order={3}>Recent Tickets</Title>
            <Stack gap="sm">
              {dashboardData.recentTickets.map((ticket) => (
                <Card key={ticket.id} withBorder p="sm">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Badge color={getStatusColor(ticket.status)} variant="light">
                        {ticket.status}
                      </Badge>
                      <Badge color={getPriorityColor(ticket.priority)} variant="outline">
                        {ticket.priority}
                      </Badge>
                      <Text fw={500}>{ticket.title}</Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Text>
                  </Group>
                </Card>
              ))}
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  )

  const renderTechnicianDashboard = () => (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Technician Dashboard</Title>
        <Tooltip label="Refresh data">
          <ActionIcon variant="subtle" onClick={handleRefresh}>
            <IconRefresh size="1rem" />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Grid>
        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Card withBorder shadow="sm" style={{ height: '100%' }}>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Assigned to Me
                </Text>
                <Text size="xl" fw={700}>
                  {dashboardData?.assignedToMeCount || 0}
                </Text>
              </div>
              <ThemeIcon size="lg" variant="light" color="blue">
                <IconTicket size="1.5rem" />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Card withBorder shadow="sm" style={{ height: '100%' }}>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  My Tickets
                </Text>
                <Text size="xl" fw={700}>
                  {dashboardData?.myTicketsCount || 0}
                </Text>
              </div>
              <ThemeIcon size="lg" variant="light" color="green">
                <IconCheck size="1.5rem" />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
          <Card withBorder shadow="sm" style={{ height: '100%' }}>
            <Group justify="space-between">
              <div>
                <Text size="sm" c="dimmed">
                  Open Tickets
                </Text>
                <Text size="xl" fw={700}>
                  {dashboardData?.myOpenTickets || 0}
                </Text>
              </div>
              <ThemeIcon size="lg" variant="light" color="orange">
                <IconClock size="1.5rem" />
              </ThemeIcon>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {ticketStats && (
        <Card withBorder>
          <Stack gap="md">
            <Title order={3}>System Overview</Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Total Tickets
                      </Text>
                      <Text size="lg" fw={700}>
                        {ticketStats.totalTickets}
                      </Text>
                    </div>
                    <ThemeIcon size="md" variant="light" color="blue">
                      <IconChartBar size="1rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Assigned Tickets
                      </Text>
                      <Text size="lg" fw={700}>
                        {ticketStats.assignedTickets}
                      </Text>
                    </div>
                    <ThemeIcon size="md" variant="light" color="green">
                      <IconUsers size="1rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Closed Tickets
                      </Text>
                      <Text size="lg" fw={700}>
                        {ticketStats.closedTickets}
                      </Text>
                    </div>
                    <ThemeIcon size="md" variant="light" color="teal">
                      <IconCheck size="1rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>
      )}

      {dashboardData?.urgentTickets && dashboardData.urgentTickets.length > 0 && (
        <Card withBorder>
          <Stack gap="md">
            <Group>
              <ThemeIcon color="red" variant="light">
                <IconAlertTriangle size="1rem" />
              </ThemeIcon>
              <Title order={3}>Urgent Tickets</Title>
            </Group>
            <Stack gap="sm">
              {dashboardData.urgentTickets.map((ticket) => (
                <Alert key={ticket.id} color="red" variant="light">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Badge color={getStatusColor(ticket.status)} variant="light">
                        {ticket.status}
                      </Badge>
                      <Badge color={getPriorityColor(ticket.priority)} variant="outline">
                        {ticket.priority}
                      </Badge>
                      <Text fw={500}>{ticket.title}</Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Text>
                  </Group>
                </Alert>
              ))}
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  )

  const renderAdminDashboard = () => (
    <Stack gap="lg">
      <Group justify="space-between">
        <Title order={2}>Admin Dashboard</Title>
        <Tooltip label="Refresh data">
          <ActionIcon variant="subtle" onClick={handleRefresh}>
            <IconRefresh size="1rem" />
          </ActionIcon>
        </Tooltip>
      </Group>

      {userStats && (
        <Card withBorder>
          <Stack gap="md">
            <Title order={3}>User Statistics</Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Total Users
                      </Text>
                      <Text size="xl" fw={700}>
                        {userStats.totalUsers}
                      </Text>
                    </div>
                    <ThemeIcon size="lg" variant="light" color="blue">
                      <IconUsers size="1.5rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Active Users
                      </Text>
                      <Text size="xl" fw={700}>
                        {userStats.activeUsers}
                      </Text>
                    </div>
                    <ThemeIcon size="lg" variant="light" color="green">
                      <IconCheck size="1.5rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Technicians
                      </Text>
                      <Text size="xl" fw={700}>
                        {userStats.technicians}
                      </Text>
                    </div>
                    <ThemeIcon size="lg" variant="light" color="orange">
                      <IconTicket size="1.5rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Admins
                      </Text>
                      <Text size="xl" fw={700}>
                        {userStats.admins}
                      </Text>
                    </div>
                    <ThemeIcon size="lg" variant="light" color="red">
                      <IconChartBar size="1.5rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>
      )}

      {ticketStats && (
        <Card withBorder>
          <Stack gap="md">
            <Title order={3}>Ticket Statistics</Title>
            <Grid>
              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Total Tickets
                      </Text>
                      <Text size="xl" fw={700}>
                        {ticketStats.totalTickets}
                      </Text>
                    </div>
                    <ThemeIcon size="lg" variant="light" color="blue">
                      <IconChartBar size="1.5rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Open Tickets
                      </Text>
                      <Text size="xl" fw={700}>
                        {ticketStats.openTickets}
                      </Text>
                    </div>
                    <ThemeIcon size="lg" variant="light" color="orange">
                      <IconClock size="1.5rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        In Progress
                      </Text>
                      <Text size="xl" fw={700}>
                        {ticketStats.inProgressTickets}
                      </Text>
                    </div>
                    <ThemeIcon size="lg" variant="light" color="yellow">
                      <IconTrendingUp size="1.5rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>

              <Grid.Col span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card withBorder p="md" shadow="sm" style={{ height: '100%' }}>
                  <Group justify="space-between">
                    <div>
                      <Text size="sm" c="dimmed">
                        Closed Tickets
                      </Text>
                      <Text size="xl" fw={700}>
                        {ticketStats.closedTickets}
                      </Text>
                    </div>
                    <ThemeIcon size="lg" variant="light" color="teal">
                      <IconCheck size="1.5rem" />
                    </ThemeIcon>
                  </Group>
                </Card>
              </Grid.Col>
            </Grid>
          </Stack>
        </Card>
      )}

      {dashboardData?.unassignedTickets && dashboardData.unassignedTickets.length > 0 && (
        <Card withBorder>
          <Stack gap="md">
            <Group>
              <ThemeIcon color="orange" variant="light">
                <IconAlertTriangle size="1rem" />
              </ThemeIcon>
              <Title order={3}>Unassigned Tickets</Title>
            </Group>
            <Stack gap="sm">
              {dashboardData.unassignedTickets.map((ticket) => (
                <Alert key={ticket.id} color="orange" variant="light">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <Badge color={getStatusColor(ticket.status)} variant="light">
                        {ticket.status}
                      </Badge>
                      <Badge color={getPriorityColor(ticket.priority)} variant="outline">
                        {ticket.priority}
                      </Badge>
                      <Text fw={500}>{ticket.title}</Text>
                    </Group>
                    <Text size="sm" c="dimmed">
                      {new Date(ticket.createdAt).toLocaleDateString()}
                    </Text>
                  </Group>
                </Alert>
              ))}
            </Stack>
          </Stack>
        </Card>
      )}
    </Stack>
  )

  const renderDashboard = () => {
    if (authStore.isAdmin) {
      return renderAdminDashboard()
    } else if (authStore.isTechnician) {
      return renderTechnicianDashboard()
    } else {
      return renderUserDashboard()
    }
  }

  return (
    <Flex direction="column" h="100%">
      <Group justify="space-between" wrap="wrap" mb="lg">
        <Box>
          <Title order={1} c="dark">Welcome to SAV System</Title>
          <Text c="dimmed" size="lg">
            Support ticket management dashboard
          </Text>
        </Box>
        <Group gap="sm">
          <Text size="sm" c="dimmed" fw={500}>
            {authStore.isAdmin ? 'Administrator' : authStore.isTechnician ? 'Technician' : 'User'}
          </Text>
        </Group>
      </Group>

      <Box style={{ flex: 1 }}>
        {renderDashboard()}
      </Box>
    </Flex>
  )
}
