import { useState } from 'react'
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
  Button,
  Alert,
  Skeleton,
  ActionIcon,
  Tooltip,
  Select,
  TextInput,
  Pagination,
} from '@mantine/core'
import {
  IconTicket,
  IconRefresh,
  IconSearch,
  IconPlus,
  IconCalendar,
  IconUser,
  IconUsers,
} from '@tabler/icons-react'
import { ticketsApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { getStatusColor, getPriorityColor } from '@/utils/statusUtils'
import { formatDate } from '@/utils/formatDate'
import { TicketStatus, Priority, Team } from '@/constants/roles'
import type { TicketResponse } from '@/types'

export default function TicketsList() {
  const navigate = useNavigate()
  const { isAdmin, isTechnician } = useAuthStore()
  const [page, setPage] = useState(0)
  const [pageSize] = useState(10)
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    team: '',
    searchTerm: '',
  })

  // Use different API endpoints based on user role
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['tickets', page, pageSize, filters, isAdmin, isTechnician],
    queryFn: async () => {
      // Admin and Technicians can see all tickets
      if (isAdmin || isTechnician) {
        return ticketsApi.getAll({
          page,
          size: pageSize,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        })
      } else {
        // Regular users can only see their own tickets with pagination
        return ticketsApi.getMyTicketsWithPagination({
          page,
          size: pageSize,
          sortBy: 'createdAt',
          sortDirection: 'desc',
        })
      }
    },
  })

  const handleTicketClick = (ticket: TicketResponse) => {
    navigate({ to: `/tickets/${ticket.id}` })
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  // const handlePageSizeChange = (newSize: number) => {
  //   setPageSize(newSize)
  //   setPage(0) // Reset to first page when changing page size
  // }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(0) // Reset to first page when filtering
  }

  const tickets = data?.content || []
  const totalPages = data?.totalPages || 0
  // const totalItems = data?.totalElements || 0

  // Filter tickets based on current filters
  const filteredTickets = tickets.filter((ticket) => {
    if (filters.status && ticket.status !== filters.status) return false
    if (filters.priority && ticket.priority !== filters.priority) return false
    if (filters.team && ticket.assignedTeam !== filters.team) return false
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      return (
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const pageTitle = isAdmin || isTechnician ? 'All Tickets' : 'My Tickets'

  if (isLoading) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '1rem'
      }}>
        <Group justify="space-between" mb="lg">
          <Group gap="sm">
            <IconTicket size="2rem" />
            <Title order={1}>{pageTitle}</Title>
          </Group>
        </Group>
        <Grid>
          {Array.from({ length: 6 }).map((_, i) => (
            <Grid.Col key={i} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
              <Skeleton height={200} />
            </Grid.Col>
          ))}
        </Grid>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '1rem'
      }}>
        <Group justify="space-between" mb="lg">
          <Group gap="sm">
            <IconTicket size="2rem" />
            <Title order={1}>{pageTitle}</Title>
          </Group>
        </Group>
        <Alert color="red" title="Error loading tickets">
          Failed to load tickets. Please try again.
        </Alert>
      </div>
    )
  }

  const showTeamFilter = isAdmin || isTechnician

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '1rem'
    }}>
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconTicket size="2rem" />
          <Title order={1}>{pageTitle}</Title>
        </Group>
        <Group gap="sm">
          <Tooltip label="Refresh tickets">
            <ActionIcon variant="subtle" onClick={() => refetch()}>
              <IconRefresh size="1rem" />
            </ActionIcon>
          </Tooltip>
          <Button
            leftSection={<IconPlus size="1rem" />}
            onClick={() => navigate({ to: '/tickets/create' })}
          >
            Create Ticket
          </Button>
        </Group>
      </Group>

      {/* Filters */}
      <Card withBorder mb="md">
        <Stack gap="md">
          <Title order={3}>Filters</Title>
          <Grid>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Status"
                placeholder="All Status"
                value={filters.status}
                onChange={(value) => handleFilterChange('status', value || '')}
                data={[
                  { value: '', label: 'All Status' },
                  ...Object.values(TicketStatus).map((status) => ({
                    value: status,
                    label: status.replace('_', ' ').toUpperCase(),
                  })),
                ]}
              />
            </Grid.Col>
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <Select
                label="Priority"
                placeholder="All Priorities"
                value={filters.priority}
                onChange={(value) => handleFilterChange('priority', value || '')}
                data={[
                  { value: '', label: 'All Priorities' },
                  ...Object.values(Priority).map((priority) => ({
                    value: priority,
                    label: priority.replace('_', ' ').toUpperCase(),
                  })),
                ]}
              />
            </Grid.Col>
            {showTeamFilter && (
              <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
                <Select
                  label="Team"
                  placeholder="All Teams"
                  value={filters.team}
                  onChange={(value) => handleFilterChange('team', value || '')}
                  data={[
                    { value: '', label: 'All Teams' },
                    ...Object.values(Team).map((team) => ({
                      value: team,
                      label: team.replace('_', ' ').toUpperCase(),
                    })),
                  ]}
                />
              </Grid.Col>
            )}
            <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
              <TextInput
                label="Search"
                placeholder="Search tickets..."
                value={filters.searchTerm}
                onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
                leftSection={<IconSearch size="1rem" />}
              />
            </Grid.Col>
          </Grid>
        </Stack>
      </Card>

      {/* Tickets Grid */}
      {filteredTickets.length === 0 ? (
        <Alert color="blue" title="No tickets found" icon={<IconTicket size="1rem" />}>
          {tickets.length === 0
            ? isAdmin || isTechnician
              ? 'No tickets have been created yet.'
              : "You haven't created any tickets yet."
            : 'No tickets match your current filters.'}
        </Alert>
      ) : (
        <>
          <Grid>
            {filteredTickets.map((ticket) => (
              <Grid.Col key={ticket.id} span={{ base: 12, sm: 6, md: 4, lg: 3 }}>
                <Card
                  withBorder
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleTicketClick(ticket)}
                >
                  <Stack gap="md">
                    <Group justify="space-between">
                      <Badge color={getStatusColor(ticket.status)} variant="light">
                        {ticket.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                      <Badge color={getPriorityColor(ticket.priority)} variant="outline">
                        {ticket.priority.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </Group>

                    <div>
                      <Title order={4} mb="xs">
                        #{ticket.id} - {ticket.title}
                      </Title>
                      <Text size="sm" c="dimmed" lineClamp={3}>
                        {ticket.description}
                      </Text>
                    </div>

                    <Stack gap="xs">
                      <Group gap="xs">
                        <IconCalendar size="0.8rem" />
                        <Text size="sm" c="dimmed">
                          Created: {formatDate(ticket.createdAt)}
                        </Text>
                      </Group>

                      {ticket.assignedTeam && (
                        <Group gap="xs">
                          <IconUsers size="0.8rem" />
                          <Text size="sm" c="dimmed">
                            Team: {ticket.assignedTeam.replace('_', ' ').toUpperCase()}
                          </Text>
                        </Group>
                      )}

                      {ticket.assignedUserId && (
                        <Group gap="xs">
                          <IconUser size="0.8rem" />
                          <Text size="sm" c="dimmed">
                            Assigned to: {ticket.assignedUserId}
                          </Text>
                        </Group>
                      )}
                    </Stack>
                  </Stack>
                </Card>
              </Grid.Col>
            ))}
          </Grid>

          {/* Pagination */}
          {totalPages > 1 && (
            <Group justify="center" mt="xl">
              <Pagination
                value={page + 1}
                onChange={(newPage) => handlePageChange(newPage - 1)}
                total={totalPages}
                size="sm"
              />
            </Group>
          )}
        </>
      )}
    </div>
  )
}
