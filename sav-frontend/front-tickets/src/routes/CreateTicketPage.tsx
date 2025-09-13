import { Title, Group, Stack } from '@mantine/core'
import { IconTicket } from '@tabler/icons-react'
import { TicketForm } from '@/components/TicketForm'

export default function CreateTicketPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '1rem',
      }}
    >
      <Stack gap="lg" style={{ maxWidth: '100%', width: '100%' }}>
        <Group gap="sm" mb="lg">
          <IconTicket size="2rem" />
          <Title order={1}>Create New Ticket</Title>
        </Group>

        <TicketForm />
      </Stack>
    </div>
  )
}
