import { Container, Title, Text, Alert, Stack, Card, Group, Switch, Button } from '@mantine/core'
import { IconSettings, IconInfoCircle, IconDeviceFloppy } from '@tabler/icons-react'
import { useState } from 'react'

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    autoAssignment: false,
    ticketEscalation: true,
    systemMaintenance: false,
  })

  const handleSave = () => {
    // TODO: Implement settings save functionality
    console.log('Saving settings:', settings)
  }

  return (
    <Container size="lg" py="md">
      <Stack gap="lg">
        <Group>
          <IconSettings size="2rem" />
          <Title order={2}>System Settings</Title>
        </Group>

        <Alert icon={<IconInfoCircle size="1rem" />} color="blue" title="Settings Management">
          System settings are currently under development. Basic configuration options will be
          available soon.
        </Alert>

        <Card withBorder p="md">
          <Stack gap="md">
            <Title order={3}>Notification Settings</Title>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Email Notifications</Text>
                <Text size="sm" c="dimmed">
                  Send email notifications for ticket updates
                </Text>
              </div>
              <Switch
                checked={settings.emailNotifications}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    emailNotifications: event.currentTarget.checked,
                  }))
                }
              />
            </Group>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Auto Assignment</Text>
                <Text size="sm" c="dimmed">
                  Automatically assign tickets to available technicians
                </Text>
              </div>
              <Switch
                checked={settings.autoAssignment}
                onChange={(event) =>
                  setSettings((prev) => ({ ...prev, autoAssignment: event.currentTarget.checked }))
                }
              />
            </Group>

            <Group justify="space-between">
              <div>
                <Text fw={500}>Ticket Escalation</Text>
                <Text size="sm" c="dimmed">
                  Escalate high-priority tickets after timeout
                </Text>
              </div>
              <Switch
                checked={settings.ticketEscalation}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    ticketEscalation: event.currentTarget.checked,
                  }))
                }
              />
            </Group>

            <Group justify="space-between">
              <div>
                <Text fw={500}>System Maintenance Mode</Text>
                <Text size="sm" c="dimmed">
                  Enable maintenance mode to restrict access
                </Text>
              </div>
              <Switch
                checked={settings.systemMaintenance}
                onChange={(event) =>
                  setSettings((prev) => ({
                    ...prev,
                    systemMaintenance: event.currentTarget.checked,
                  }))
                }
              />
            </Group>

            <Group justify="flex-end" mt="md">
              <Button leftSection={<IconDeviceFloppy size="1rem" />} onClick={handleSave} disabled>
                Save Settings
              </Button>
            </Group>
          </Stack>
        </Card>
      </Stack>
    </Container>
  )
}
