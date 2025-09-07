import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Stack,
  Badge,
  Button,
  Alert,
  Skeleton,
  ActionIcon,
  Tooltip,
  Select,
} from '@mantine/core'
import { IconTicket, IconRefresh, IconCalendar, IconAlertTriangle } from '@tabler/icons-react'
import { ticketsApi, usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import { getStatusColor, getPriorityColor } from '@/utils/statusUtils'
import { Team } from '@/constants/roles'
import type { TicketResponse, UserResponse, AssignTeamRequest, AssignUserRequest } from '@/types'

export default function UnassignedTickets() {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string>('')

  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery<TicketResponse[]>({
    queryKey: ['tickets', 'unassigned'],
    queryFn: () => ticketsApi.getByStatus('OPEN'),
  })

  const { data: technicians } = useQuery<UserResponse[]>({
    queryKey: ['technicians'],
    queryFn: () => usersApi.getTechnicians(),
  })

  const assignTeamMutation = useMutation({
    mutationFn: ({ ticketId, request }: { ticketId: number; request: AssignTeamRequest }) =>
      ticketsApi.assignTeam(ticketId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setActionError('')
    },
    onError: (error: unknown) => {
      setActionError(getErrorMessage(error))
    },
  })

  const assignUserMutation = useMutation({
    mutationFn: ({ ticketId, request }: { ticketId: number; request: AssignUserRequest }) =>
      ticketsApi.assignUser(ticketId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setActionError('')
    },
    onError: (error: unknown) => {
      setActionError(getErrorMessage(error))
    },
  })

  const handleTeamAssignment = (ticketId: number, team: Team) => {
    assignTeamMutation.mutate({ ticketId, request: { team } })
  }

  const handleUserAssignment = (ticketId: number, userId: string) => {
    assignUserMutation.mutate({ ticketId, request: { userId } })
  }

  if (isLoading) {
    return (
      <Container size="xl" py="md">
        <Group justify="space-between" mb="lg">
          <Group gap="sm">
            <IconTicket size="2rem" />
            <Title order={1}>Unassigned Tickets</Title>
          </Group>
        </Group>
        <Grid>
          {Array.from({ length: 6 }).map((_, i) => (
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
        <Group justify="space-between" mb="lg">
          <Group gap="sm">
            <IconTicket size="2rem" />
            <Title order={1}>Unassigned Tickets</Title>
          </Group>
        </Group>
        <Alert color="red" title="Error loading tickets">
          {getErrorMessage(error)}
        </Alert>
      </Container>
    )
  }

  // Filter for truly unassigned tickets
  const unassignedTickets = Array.isArray(tickets)
    ? tickets.filter((ticket: TicketResponse) => !ticket.assignedUserId && !ticket.assignedTeam)
    : []

  const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }
  const sortedTickets =
    unassignedTickets?.sort((a: TicketResponse, b: TicketResponse) => {
      const priorityDiff =
        (priorityOrder[a.priority as keyof typeof priorityOrder] || 5) -
        (priorityOrder[b.priority as keyof typeof priorityOrder] || 5)
      if (priorityDiff !== 0) return priorityDiff
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    }) || []

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconTicket size="2rem" />
          <Title order={1}>Unassigned Tickets</Title>
        </Group>
        <Tooltip label="Refresh tickets">
          <ActionIcon
            variant="subtle"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['tickets'] })}
          >
            <IconRefresh size="1rem" />
          </ActionIcon>
        </Tooltip>
      </Group>

      {actionError && (
        <Alert color="red" title="Action Error" mb="md">
          {actionError}
        </Alert>
      )}

      {sortedTickets && sortedTickets.length > 0 && (
        <Alert
          color="yellow"
          title="Unassigned Tickets"
          mb="md"
          icon={<IconAlertTriangle size="1rem" />}
        >
          <strong>{sortedTickets.length}</strong> unassigned ticket
          {sortedTickets.length !== 1 ? 's' : ''} requiring attention
        </Alert>
      )}

      <Grid>
        {sortedTickets?.map((ticket: TicketResponse) => (
          <Grid.Col key={ticket.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card
              withBorder
              style={{ borderLeft: `4px solid ${getPriorityColor(ticket.priority)}` }}
            >
              <Stack gap="md">
                <Group justify="space-between">
                  <div>
                    <Title order={4}>
                      <a
                        href={`/tickets/${ticket.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                      >
                        #{ticket.id} - {ticket.title}
                      </a>
                    </Title>
                    <Group gap="xs" mt="xs">
                      <IconCalendar size="0.8rem" />
                      <Text size="sm" c="dimmed">
                        {formatDate(ticket.createdAt)}
                      </Text>
                    </Group>
                  </div>

                  <Stack gap="xs" align="flex-end">
                    <Badge color={getStatusColor(ticket.status)} variant="light">
                      {ticket.status}
                    </Badge>
                    <Badge color={getPriorityColor(ticket.priority)} variant="outline">
                      {ticket.priority}
                    </Badge>
                  </Stack>
                </Group>

                <Stack gap="xs">
                  <Group gap="xs">
                    <Text fw={500} size="sm">
                      Type:
                    </Text>
                    <Text size="sm">{ticket.type}</Text>
                  </Group>

                  <div>
                    <Text fw={500} size="sm" mb="xs">
                      Description:
                    </Text>
                    <Text
                      size="sm"
                      c="dimmed"
                      style={{
                        lineHeight: '1.4',
                        maxHeight: '60px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {ticket.description}
                    </Text>
                  </div>
                </Stack>

                <Stack gap="md" pt="md" style={{ borderTop: '1px solid #dee2e6' }}>
                  <Title order={5}>Assign Ticket</Title>

                  {/* Team Assignment */}
                  <Stack gap="xs">
                    <Text fw={500} size="sm">
                      Assign to Team:
                    </Text>
                    <Group gap="xs">
                      <Button
                        size="xs"
                        color="cyan"
                        onClick={() => handleTeamAssignment(ticket.id, Team.SUPPORT)}
                        loading={assignTeamMutation.isPending}
                      >
                        Support Team
                      </Button>
                      <Button
                        size="xs"
                        color="violet"
                        onClick={() => handleTeamAssignment(ticket.id, Team.DEVELOPMENT)}
                        loading={assignTeamMutation.isPending}
                      >
                        Development Team
                      </Button>
                    </Group>
                  </Stack>

                  {/* User Assignment */}
                  <Stack gap="xs">
                    <Text fw={500} size="sm">
                      Assign to Technician:
                    </Text>
                    <Select
                      placeholder="Select a technician..."
                      data={
                        technicians?.map((tech: UserResponse) => ({
                          value: tech.id,
                          label: tech.fullName || `${tech.firstName} ${tech.lastName}`,
                        })) || []
                      }
                      onChange={(value) => {
                        if (value) {
                          handleUserAssignment(ticket.id, value)
                        }
                      }}
                      disabled={assignUserMutation.isPending}
                    />
                  </Stack>

                  {/* View Details */}
                  <Button
                    fullWidth
                    variant="light"
                    leftSection={<IconTicket size="1rem" />}
                    onClick={() => (window.location.href = `/tickets/${ticket.id}`)}
                  >
                    View Full Details
                  </Button>
                </Stack>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {sortedTickets && sortedTickets.length === 0 && (
        <Alert color="blue" title="No unassigned tickets" icon={<IconTicket size="1rem" />}>
          All tickets have been assigned to teams or technicians.
        </Alert>
      )}
    </Container>
  )
}
