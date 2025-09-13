import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Badge,
  Stack,
  Alert,
  Skeleton,
} from '@mantine/core'
import { IconAlertTriangle, IconExclamationMark } from '@tabler/icons-react'
import { ticketsApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import { getStatusColor, getPriorityColor } from '@/utils/statusUtils'
import { Priority } from '@/constants/roles'
import type { TicketResponse } from '@/types'

export default function HighPriorityTickets() {
  const navigate = useNavigate()
  const {
    data: highTickets,
    isLoading: isLoadingHigh,
    error: highError,
  } = useQuery<TicketResponse[]>({
    queryKey: ['tickets', 'priority', 'HIGH'],
    queryFn: () => ticketsApi.getByPriority(Priority.HIGH),
  })

  const {
    data: criticalTickets,
    isLoading: isLoadingCritical,
    error: criticalError,
  } = useQuery<TicketResponse[]>({
    queryKey: ['tickets', 'priority', 'CRITICAL'],
    queryFn: () => ticketsApi.getByPriority(Priority.CRITICAL),
  })

  const isLoading = isLoadingHigh || isLoadingCritical
  const error = highError || criticalError

  if (isLoading) {
    return (
      <Container size="xl" py="md">
        <Title order={1} mb="lg">
          High Priority Tickets
        </Title>
        <Grid>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4 }}>
              <Skeleton height={200} />
            </Grid.Col>
          ))}
        </Grid>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="xl" py="md">
        <Title order={1} mb="lg">
          High Priority Tickets
        </Title>
        <Alert color="red" title="Error" icon={<IconAlertTriangle size="1rem" />}>
          Error loading tickets: {getErrorMessage(error)}
        </Alert>
      </Container>
    )
  }

  // Combine and sort tickets by priority and creation date
  const allHighPriorityTickets = [...(criticalTickets || []), ...(highTickets || [])].sort(
    (a, b) => {
      // Critical first, then high, then by creation date
      if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1
      if (b.priority === 'CRITICAL' && a.priority !== 'CRITICAL') return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    },
  )

  const openHighPriority = allHighPriorityTickets.filter(
    (t) => t.status === 'OPEN' || t.status === 'ASSIGNED',
  )
  const inProgressHighPriority = allHighPriorityTickets.filter((t) => t.status === 'IN_PROGRESS')

  return (
    <Container size="xl" py="md">
      <Title order={1} mb="lg">
        High Priority Tickets
      </Title>

      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" style={{ textAlign: 'center' }}>
            <Text size="xl" fw={700} c="red">
              {criticalTickets?.length || 0}
            </Text>
            <Text size="sm" c="dimmed">
              Critical Priority
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" style={{ textAlign: 'center' }}>
            <Text size="xl" fw={700} c="orange">
              {highTickets?.length || 0}
            </Text>
            <Text size="sm" c="dimmed">
              High Priority
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" style={{ textAlign: 'center' }}>
            <Text size="xl" fw={700} c="pink">
              {openHighPriority.length}
            </Text>
            <Text size="sm" c="dimmed">
              Awaiting Assignment
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Card withBorder p="md" style={{ textAlign: 'center' }}>
            <Text size="xl" fw={700} c="cyan">
              {inProgressHighPriority.length}
            </Text>
            <Text size="sm" c="dimmed">
              In Progress
            </Text>
          </Card>
        </Grid.Col>
      </Grid>

      {/* Critical Tickets Section */}
      {criticalTickets && criticalTickets.length > 0 && (
        <Stack gap="md" mb="xl">
          <Group gap="sm">
            <IconExclamationMark size="1.5rem" color="red" />
            <Title order={2} c="red">
              Critical Priority Tickets
            </Title>
          </Group>
          <Grid>
            {criticalTickets.map((ticket) => (
              <Grid.Col key={ticket.id} span={{ base: 12, sm: 6, md: 4 }}>
                <TicketCard
                  ticket={ticket}
                  isCritical={true}
                  onViewTicket={(ticketId) => navigate({ to: `/tickets/${ticketId}` })}
                  onNavigateToUnassigned={() => navigate({ to: '/workflow/unassigned' })}
                />
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      )}

      {/* High Priority Tickets Section */}
      {highTickets && highTickets.length > 0 && (
        <Stack gap="md" mb="xl">
          <Group gap="sm">
            <IconAlertTriangle size="1.5rem" color="orange" />
            <Title order={2} c="orange">
              High Priority Tickets
            </Title>
          </Group>
          <Grid>
            {highTickets.map((ticket) => (
              <Grid.Col key={ticket.id} span={{ base: 12, sm: 6, md: 4 }}>
                <TicketCard
                  ticket={ticket}
                  isCritical={false}
                  onViewTicket={(ticketId) => navigate({ to: `/tickets/${ticketId}` })}
                  onNavigateToUnassigned={() => navigate({ to: '/workflow/unassigned' })}
                />
              </Grid.Col>
            ))}
          </Grid>
        </Stack>
      )}

      {allHighPriorityTickets.length === 0 && (
        <Alert
          color="blue"
          title="No high priority tickets"
          icon={<IconAlertTriangle size="1rem" />}
        >
          There are currently no high or critical priority tickets in the system.
        </Alert>
      )}
    </Container>
  )
}

interface TicketCardProps {
  ticket: TicketResponse
  isCritical: boolean
  onViewTicket: (ticketId: number) => void
  onNavigateToUnassigned: () => void
}

function TicketCard({ ticket, isCritical, onViewTicket, onNavigateToUnassigned }: TicketCardProps) {
  return (
    <Card
      withBorder
      p="md"
      style={{
        backgroundColor: isCritical ? '#ffeaea' : '#fff8e1',
        borderLeft: `4px solid ${getPriorityColor(ticket.priority)}`,
      }}
    >
      <Stack gap="md">
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={4} mb="xs">
              <a
                onClick={() => onViewTicket(ticket.id)}
                style={{ textDecoration: 'none', color: '#007bff' }}
              >
                #{ticket.id} - {ticket.title}
              </a>
            </Title>
            <Text size="sm" c="dimmed">
              Created: {formatDate(ticket.createdAt)}
            </Text>
            {ticket.updatedAt !== ticket.createdAt && (
              <Text size="xs" c="dimmed">
                Updated: {formatDate(ticket.updatedAt)}
              </Text>
            )}
          </div>

          <Stack gap="xs" align="flex-end">
            <Badge color={getStatusColor(ticket.status)} variant="light">
              {ticket.status}
            </Badge>
            <Badge color={getPriorityColor(ticket.priority)} variant="filled">
              {ticket.priority}
            </Badge>
          </Stack>
        </Group>

        <Grid>
          <Grid.Col span={6}>
            <Text size="sm" fw={500}>
              Type:
            </Text>
            <Text size="sm">{ticket.type}</Text>
          </Grid.Col>
          {ticket.assignedTeam && (
            <Grid.Col span={6}>
              <Text size="sm" fw={500}>
                Team:
              </Text>
              <Badge color="gray" variant="light" size="sm">
                {ticket.assignedTeam}
              </Badge>
            </Grid.Col>
          )}
        </Grid>

        <div>
          <Text size="sm" fw={500} mb="xs">
            Description:
          </Text>
          <Text size="sm" c="dimmed" lineClamp={3}>
            {ticket.description}
          </Text>
        </div>

        <Group gap="sm" pt="sm" style={{ borderTop: '1px solid #dee2e6' }}>
          <button
            onClick={() => onViewTicket(ticket.id)}
            style={{
              padding: '8px 15px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            View Details
          </button>

          {!ticket.assignedUserId && !ticket.assignedTeam && (
            <a
              onClick={onNavigateToUnassigned}
              style={{
                padding: '8px 15px',
                backgroundColor: '#dc3545',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '4px',
                fontSize: '14px',
              }}
            >
              Assign Now
            </a>
          )}
        </Group>
      </Stack>
    </Card>
  )
}
