import { useQuery } from '@tanstack/react-query'
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Group,
  Stack,
  Badge,
  Avatar,
  Skeleton,
  Alert,
  ActionIcon,
  Tooltip,
} from '@mantine/core'
import {
  IconUsers,
  IconRefresh,
  IconEye,
  IconEdit,
  IconPhone,
  IconCalendar,
} from '@tabler/icons-react'
import { usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import type { UserResponse } from '@/types'

export default function UserList() {
  const {
    data: users,
    isLoading,
    error,
    refetch,
  } = useQuery<UserResponse[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })

  if (isLoading) {
    return (
      <Container size="xl" py="md">
        <Group justify="space-between" mb="lg">
          <Title order={1}>Users</Title>
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
          <Title order={1}>Users</Title>
        </Group>
        <Alert color="red" title="Error loading users">
          {getErrorMessage(error)}
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="lg">
        <Group gap="sm">
          <IconUsers size="2rem" />
          <Title order={1}>Users</Title>
        </Group>
        <Tooltip label="Refresh users">
          <ActionIcon variant="subtle" onClick={() => refetch()}>
            <IconRefresh size="1rem" />
          </ActionIcon>
        </Tooltip>
      </Group>

      <Grid>
        {users?.map((user: UserResponse) => (
          <Grid.Col key={user.id} span={{ base: 12, sm: 6, md: 4 }}>
            <Card withBorder>
              <Stack gap="md">
                <Group justify="space-between">
                  <Avatar size="lg" color="blue">
                    {(user.firstName?.[0] || '') + (user.lastName?.[0] || '')}
                  </Avatar>
                  <Badge
                    color={
                      user.status === 'ACTIVE'
                        ? 'green'
                        : user.status === 'SUSPENDED'
                          ? 'red'
                          : 'yellow'
                    }
                    variant="light"
                  >
                    {user.status}
                  </Badge>
                </Group>

                <div>
                  <Title order={4}>{user.fullName || `${user.firstName} ${user.lastName}`}</Title>
                  <Text c="dimmed" size="sm">
                    @{user.username}
                  </Text>
                  <Text c="dimmed" size="sm">
                    {user.email}
                  </Text>
                </div>

                <Stack gap="xs">
                  {user.phoneNumber && (
                    <Group gap="xs">
                      <IconPhone size="1rem" />
                      <Text size="sm">{user.phoneNumber}</Text>
                    </Group>
                  )}

                  {user.company && (
                    <Group gap="xs">
                      <IconUsers size="1rem" />
                      <Text size="sm">{user.company}</Text>
                    </Group>
                  )}

                  {user.department && (
                    <Group gap="xs">
                      <IconUsers size="1rem" />
                      <Text size="sm">{user.department}</Text>
                    </Group>
                  )}

                  <Group gap="xs">
                    <IconCalendar size="1rem" />
                    <Text size="sm">Created: {formatDate(user.createdAt)}</Text>
                  </Group>
                </Stack>

                <Group justify="space-between">
                  <Badge
                    color={
                      user.role === 'ADMIN' ? 'red' : user.role === 'TECHNICIAN' ? 'blue' : 'green'
                    }
                    variant="light"
                  >
                    {user.role}
                  </Badge>

                  <Group gap="xs">
                    <Tooltip label="View user">
                      <ActionIcon
                        variant="subtle"
                        color="blue"
                        onClick={() => {
                          // TODO: Navigate to user detail page
                          console.log('View user:', user.id)
                        }}
                      >
                        <IconEye size="1rem" />
                      </ActionIcon>
                    </Tooltip>

                    <Tooltip label="Edit user">
                      <ActionIcon
                        variant="subtle"
                        color="green"
                        onClick={() => {
                          // TODO: Navigate to edit user page
                          console.log('Edit user:', user.id)
                        }}
                      >
                        <IconEdit size="1rem" />
                      </ActionIcon>
                    </Tooltip>
                  </Group>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        ))}
      </Grid>

      {users && users.length === 0 && (
        <Alert color="blue" title="No users found">
          There are no users to display at the moment.
        </Alert>
      )}
    </Container>
  )
}
