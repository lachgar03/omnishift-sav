import { 
  Container, 
  Title, 
  Text, 
  Card, 
  Stack, 
  Group, 
  Button,
  TextInput,
  Select,
  Switch,
  Divider,
  Avatar,
  ActionIcon,
  Grid,
  Badge
} from '@mantine/core'
import { 
  IconUser, 
  IconMail, 
  IconPhone, 
  IconSettings, 
  IconBell, 
  IconShield,
  IconDeviceFloppy,
  IconEdit
} from '@tabler/icons-react'
import { useAuthStore } from '@store/authStore'

export default function SettingsPage() {
  const { user } = useAuthStore()

  return (
    <Container size="xl" py="md">
      <Stack gap="lg">
        <Group justify="space-between">
          <div>
            <Title order={1}>Settings</Title>
            <Text c="dimmed" size="lg">
              Manage your account and preferences
            </Text>
          </div>
        </Group>

        <Grid>
          <Grid.Col span={{ base: 12, md: 8 }}>
            <Stack gap="lg">
              {/* Profile Settings */}
              <Card withBorder>
                <Stack gap="md">
                  <Group justify="space-between">
                    <Group gap="sm">
                      <IconUser size="1.5rem" />
                      <Title order={3}>Profile Information</Title>
                    </Group>
                    <ActionIcon variant="subtle">
                      <IconEdit size="1rem" />
                    </ActionIcon>
                  </Group>
                  
                  <Divider />
                  
                  <Grid>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="First Name"
                        value={user?.firstName || ''}
                        leftSection={<IconUser size="1rem" />}
                        disabled
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Last Name"
                        value={user?.lastName || ''}
                        leftSection={<IconUser size="1rem" />}
                        disabled
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Email"
                        value={user?.email || ''}
                        leftSection={<IconMail size="1rem" />}
                        disabled
                      />
                    </Grid.Col>
                    <Grid.Col span={{ base: 12, sm: 6 }}>
                      <TextInput
                        label="Phone"
                        value={user?.phone || 'Not provided'}
                        leftSection={<IconPhone size="1rem" />}
                        disabled
                      />
                    </Grid.Col>
                  </Grid>
                </Stack>
              </Card>

              {/* Notification Settings */}
              <Card withBorder>
                <Stack gap="md">
                  <Group gap="sm">
                    <IconBell size="1.5rem" />
                    <Title order={3}>Notifications</Title>
                  </Group>
                  
                  <Divider />
                  
                  <Stack gap="md">
                    <Group justify="space-between">
                      <div>
                        <Text fw={500}>Email Notifications</Text>
                        <Text size="sm" c="dimmed">Receive updates via email</Text>
                      </div>
                      <Switch defaultChecked />
                    </Group>
                    
                    <Group justify="space-between">
                      <div>
                        <Text fw={500}>Ticket Updates</Text>
                        <Text size="sm" c="dimmed">Get notified when tickets are updated</Text>
                      </div>
                      <Switch defaultChecked />
                    </Group>
                    
                    <Group justify="space-between">
                      <div>
                        <Text fw={500}>System Alerts</Text>
                        <Text size="sm" c="dimmed">Receive system-wide announcements</Text>
                      </div>
                      <Switch />
                    </Group>
                  </Stack>
                </Stack>
              </Card>

              {/* Security Settings */}
              <Card withBorder>
                <Stack gap="md">
                  <Group gap="sm">
                    <IconShield size="1.5rem" />
                    <Title order={3}>Security</Title>
                  </Group>
                  
                  <Divider />
                  
                  <Stack gap="md">
                    <Button variant="outline" leftSection={<IconShield size="1rem" />}>
                      Change Password
                    </Button>
                    
                    <Button variant="outline" leftSection={<IconSettings size="1rem" />}>
                      Two-Factor Authentication
                    </Button>
                  </Stack>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>

          <Grid.Col span={{ base: 12, md: 4 }}>
            <Stack gap="lg">
              {/* User Profile Card */}
              <Card withBorder>
                <Stack gap="md" align="center">
                  <Avatar size="xl" color="blue">
                    {user?.firstName?.[0] || 'U'}
                  </Avatar>
                  
                  <div style={{ textAlign: 'center' }}>
                    <Title order={4}>{user?.firstName} {user?.lastName}</Title>
                    <Text c="dimmed" size="sm">{user?.email}</Text>
                    <Badge color="blue" variant="light" mt="xs">
                      {user?.roles?.includes('ADMIN') ? 'Administrator' : 
                       user?.roles?.includes('TECHNICIAN') ? 'Technician' : 'User'}
                    </Badge>
                  </div>
                </Stack>
              </Card>

              {/* Quick Actions */}
              <Card withBorder>
                <Stack gap="md">
                  <Title order={4}>Quick Actions</Title>
                  
                  <Button variant="light" leftSection={<IconDeviceFloppy size="1rem" />} fullWidth>
                    Save Changes
                  </Button>
                  
                  <Button variant="outline" leftSection={<IconSettings size="1rem" />} fullWidth>
                    Advanced Settings
                  </Button>
                </Stack>
              </Card>
            </Stack>
          </Grid.Col>
        </Grid>
      </Stack>
    </Container>
  )
}
