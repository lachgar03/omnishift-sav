import { useQuery } from '@tanstack/react-query'
import { useParams, useNavigate } from '@tanstack/react-router'
import { usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import {
  Container,
  Title,
  Text,
  Grid,
  Card,
  Stack,
  Group,
  Badge,
  Button,
  Avatar,
  Box,
  Loader,
  Alert,
} from '@mantine/core'
import {
  IconUser,
  IconMail,
  IconPhone,
  IconBuilding,
  IconCalendar,
  IconEdit,
  IconArrowLeft,
} from '@tabler/icons-react'
import type { UserResponse } from '@/types'

export default function UserDetail() {
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<UserResponse>({
    queryKey: ['users', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })

  if (!id) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" title="Error" icon={<IconUser size="1rem" />}>
          No user ID provided.
        </Alert>
      </Container>
    )
  }

  if (isLoading) {
    return (
      <Container size="md" py="xl">
        <Group justify="center">
          <Loader size="lg" />
          <Text>Loading user details...</Text>
        </Group>
      </Container>
    )
  }

  if (error) {
    return (
      <Container size="md" py="xl">
        <Alert color="red" title="Error" icon={<IconUser size="1rem" />}>
          Error loading user: {getErrorMessage(error)}
        </Alert>
      </Container>
    )
  }

  if (!user) {
    return (
      <Container size="md" py="xl">
        <Alert color="yellow" title="Not Found" icon={<IconUser size="1rem" />}>
          User not found.
        </Alert>
      </Container>
    )
  }

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Group justify="space-between" align="flex-start">
          <Group>
            <Avatar size="xl" color="blue">
              {user.firstName?.[0]}
              {user.lastName?.[0]}
            </Avatar>
            <Box>
              <Title order={2}>{user.fullName || `${user.firstName} ${user.lastName}`}</Title>
              <Text c="dimmed" size="lg">
                @{user.username}
              </Text>
            </Box>
          </Group>
          <Button
            leftSection={<IconEdit size="1rem" />}
            onClick={() => navigate({ to: `/users/${user.id}/edit` })}
          >
            Edit User
          </Button>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" p="md">
              <Stack gap="md">
                <Title order={3}>Basic Information</Title>

                <Group>
                  <IconMail size="1rem" />
                  <Box>
                    <Text fw={500} size="sm">
                      Email
                    </Text>
                    <Text>{user.email}</Text>
                  </Box>
                </Group>

                {user.phoneNumber && (
                  <Group>
                    <IconPhone size="1rem" />
                    <Box>
                      <Text fw={500} size="sm">
                        Phone Number
                      </Text>
                      <Text>{user.phoneNumber}</Text>
                    </Box>
                  </Group>
                )}

                <Group>
                  <IconUser size="1rem" />
                  <Box>
                    <Text fw={500} size="sm">
                      Role
                    </Text>
                    <Badge
                      color={
                        user.role === 'ADMIN'
                          ? 'red'
                          : user.role === 'TECHNICIAN'
                            ? 'blue'
                            : 'green'
                      }
                      variant="filled"
                    >
                      {user.role}
                    </Badge>
                  </Box>
                </Group>

                <Group>
                  <IconUser size="1rem" />
                  <Box>
                    <Text fw={500} size="sm">
                      Status
                    </Text>
                    <Badge
                      color={
                        user.status === 'ACTIVE'
                          ? 'green'
                          : user.status === 'INACTIVE'
                            ? 'gray'
                            : user.status === 'SUSPENDED'
                              ? 'red'
                              : 'yellow'
                      }
                      variant="filled"
                    >
                      {user.status}
                    </Badge>
                  </Box>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 6 }}>
            <Card withBorder shadow="sm" p="md">
              <Stack gap="md">
                <Title order={3}>Additional Information</Title>

                {user.company && (
                  <Group>
                    <IconBuilding size="1rem" />
                    <Box>
                      <Text fw={500} size="sm">
                        Company
                      </Text>
                      <Text>{user.company}</Text>
                    </Box>
                  </Group>
                )}

                {user.department && (
                  <Group>
                    <IconBuilding size="1rem" />
                    <Box>
                      <Text fw={500} size="sm">
                        Department
                      </Text>
                      <Text>{user.department}</Text>
                    </Box>
                  </Group>
                )}

                <Group>
                  <IconCalendar size="1rem" />
                  <Box>
                    <Text fw={500} size="sm">
                      Created
                    </Text>
                    <Text>{formatDate(user.createdAt)}</Text>
                  </Box>
                </Group>

                <Group>
                  <IconCalendar size="1rem" />
                  <Box>
                    <Text fw={500} size="sm">
                      Last Updated
                    </Text>
                    <Text>{formatDate(user.updatedAt)}</Text>
                  </Box>
                </Group>
              </Stack>
            </Card>
          </Grid.Col>
        </Grid>

        <Group justify="flex-start">
          <Button
            variant="outline"
            leftSection={<IconArrowLeft size="1rem" />}
            onClick={() => navigate({ to: '/users' })}
          >
            Back to Users
          </Button>
        </Group>
      </Stack>
    </Container>
  )
}
