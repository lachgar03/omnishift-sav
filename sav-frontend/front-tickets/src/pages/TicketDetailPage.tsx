import { useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Title,
  Text,
  Card,
  Stack,
  Group,
  Badge,
  Button,
  Textarea,
  Alert,
  Skeleton,
  Divider,
  FileInput,
  Anchor,
} from '@mantine/core'
import { IconAlertCircle, IconEdit, IconX } from '@tabler/icons-react'
import { ticketsApi, ticketMessagesApi, ticketAttachmentsApi } from '@/api'
import { useAuthStore } from '@/store/authStore'
import { formatDate } from '@/utils/formatDate'
import {
  getStatusColor,
  getPriorityColor,
  getStatusLabel,
  getPriorityLabel,
} from '@/utils/statusUtils'
import { TicketStatus } from '@/constants/roles'
import { EditTicketForm } from '@/components/EditTicketForm'

export default function TicketDetail() {
  const { id } = useParams({ from: '/tickets/$id' })

  // Early return if no ID - must be before any other hooks
  if (!id) {
    return (
      <Alert color="red" title="Invalid Ticket ID">
        No ticket ID provided in the URL.
      </Alert>
    )
  }

  return <TicketDetailContent id={id} />
}

function TicketDetailContent({ id }: { id: string }) {
  const { isAdmin, isTechnician, user } = useAuthStore()
  const queryClient = useQueryClient()
  const [messageContent, setMessageContent] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [isEditing, setIsEditing] = useState(false)

  // Fetch ticket data
  const {
    data: ticket,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['ticket', id],
    queryFn: () => ticketsApi.getById(id),
  })

  // Add message mutation
  const addMessageMutation = useMutation({
    mutationFn: (content: string) => ticketMessagesApi.create(id, { content }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      setMessageContent('')
    },
  })

  // Upload attachment mutation
  const uploadAttachmentMutation = useMutation({
    mutationFn: (file: File) => ticketAttachmentsApi.upload(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
      setFile(null)
    },
  })

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (status: TicketStatus) => ticketsApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', id] })
    },
  })

  if (isLoading) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          padding: '1rem',
        }}
      >
        <Stack gap="md">
          <Skeleton height={40} />
          <Skeleton height={200} />
          <Skeleton height={100} />
        </Stack>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div
        style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          padding: '1rem',
        }}
      >
        <Alert icon={<IconAlertCircle size="1rem" />} color="red" title="Error">
          Error loading ticket details
        </Alert>
      </div>
    )
  }

  const handleAddMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (messageContent.trim()) {
      addMessageMutation.mutate(messageContent)
    }
  }

  const handleUploadAttachment = (e: React.FormEvent) => {
    e.preventDefault()
    if (file) {
      uploadAttachmentMutation.mutate(file)
    }
  }

  const handleStatusChange = (status: TicketStatus) => {
    updateStatusMutation.mutate(status)
  }

  // Check if current user can edit this ticket
  const canEditTicket =
    user && ticket && (isAdmin || isTechnician || ticket.createdByUserId === user.id)

  // Check if current user can close their own ticket (soft delete)
  const canCloseOwnTicket =
    user &&
    ticket &&
    !isAdmin &&
    !isTechnician &&
    ticket.createdByUserId === user.id &&
    ticket.status !== TicketStatus.CLOSED

  const handleCloseOwnTicket = () => {
    if (
      window.confirm('Are you sure you want to close this ticket? This action cannot be undone.')
    ) {
      updateStatusMutation.mutate(TicketStatus.CLOSED)
    }
  }

  if (isEditing && ticket) {
    return (
      <EditTicketForm
        ticket={ticket}
        onSuccess={() => setIsEditing(false)}
        onCancel={() => setIsEditing(false)}
      />
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
        padding: '1rem',
      }}
    >
      <Stack gap="md" style={{ maxWidth: '100%', width: '100%' }}>
        <Card withBorder>
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <Title order={1}>{ticket.title}</Title>
              {canEditTicket && (
                <Group gap="sm">
                  <Button
                    leftSection={<IconEdit size="1rem" />}
                    variant="outline"
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Ticket
                  </Button>
                  {canCloseOwnTicket && (
                    <Button
                      leftSection={<IconX size="1rem" />}
                      color="orange"
                      size="sm"
                      onClick={handleCloseOwnTicket}
                    >
                      Close Ticket
                    </Button>
                  )}
                </Group>
              )}
            </Group>

            <Group gap="sm">
              <Badge color={getStatusColor(ticket.status)} variant="light">
                {getStatusLabel(ticket.status)}
              </Badge>
              <Badge color={getPriorityColor(ticket.priority)} variant="outline">
                {getPriorityLabel(ticket.priority)}
              </Badge>
              <Badge variant="light">{ticket.type}</Badge>
              <Text size="sm" c="dimmed">
                Created: {formatDate(ticket.createdAt)}
              </Text>
            </Group>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack gap="md">
            <Title order={3}>Description</Title>
            <Text>{ticket.description}</Text>
          </Stack>
        </Card>

        {(isAdmin || isTechnician) && (
          <Card withBorder>
            <Stack gap="md">
              <Title order={3}>Actions</Title>
              <Group gap="sm">
                {ticket.status !== TicketStatus.IN_PROGRESS && (
                  <Button
                    onClick={() => handleStatusChange(TicketStatus.IN_PROGRESS)}
                    loading={updateStatusMutation.isPending}
                  >
                    Start Working
                  </Button>
                )}

                {ticket.status !== TicketStatus.RESOLVED &&
                  ticket.status !== TicketStatus.CLOSED && (
                    <Button
                      color="green"
                      onClick={() => handleStatusChange(TicketStatus.RESOLVED)}
                      loading={updateStatusMutation.isPending}
                    >
                      Mark Resolved
                    </Button>
                  )}

                {ticket.status === TicketStatus.RESOLVED && (
                  <Button
                    onClick={() => handleStatusChange(TicketStatus.CLOSED)}
                    loading={updateStatusMutation.isPending}
                  >
                    Close Ticket
                  </Button>
                )}

                {ticket.status === TicketStatus.CLOSED && (
                  <Button
                    color="orange"
                    onClick={() => handleStatusChange(TicketStatus.REOPENED)}
                    loading={updateStatusMutation.isPending}
                  >
                    Reopen Ticket
                  </Button>
                )}
              </Group>
            </Stack>
          </Card>
        )}

        <Card withBorder>
          <Stack gap="md">
            <Title order={3}>Messages</Title>
            {!ticket.messages || ticket.messages.length === 0 ? (
              <Text c="dimmed">No messages yet.</Text>
            ) : (
              <Stack gap="sm">
                {ticket.messages.map((message) => (
                  <Card key={message.id} withBorder p="sm">
                    <Stack gap="xs">
                      <Group justify="space-between">
                        <Text size="sm" fw={500}>
                          User {message.authorId}
                        </Text>
                        <Text size="xs" c="dimmed">
                          {formatDate(message.createdAt)}
                        </Text>
                      </Group>
                      <Text size="sm">{message.content}</Text>
                    </Stack>
                  </Card>
                ))}
              </Stack>
            )}

            <Divider />

            <form onSubmit={handleAddMessage}>
              <Stack gap="sm">
                <Textarea
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  placeholder="Type your message..."
                  rows={3}
                  required
                />
                <Button type="submit" loading={addMessageMutation.isPending}>
                  {addMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>

        <Card withBorder>
          <Stack gap="md">
            <Title order={3}>Attachments</Title>
            {ticket.attachments && ticket.attachments.length === 0 ? (
              <Text c="dimmed">No attachments.</Text>
            ) : (
              <Stack gap="sm">
                {ticket.attachments?.map((attachment) => (
                  <Card key={attachment.id} withBorder p="sm">
                    <Group justify="space-between">
                      <div>
                        <Text size="sm" fw={500}>
                          {attachment.filename}
                        </Text>
                        <Text size="xs" c="dimmed">
                          Uploaded: {formatDate(attachment.uploadedAt)}
                        </Text>
                      </div>
                      <Group gap="xs">
                        <Anchor
                          href={attachment.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          size="sm"
                        >
                          View
                        </Anchor>
                        <Button
                          component="a"
                          href={attachment.fileUrl}
                          download={attachment.filename}
                          variant="outline"
                          size="xs"
                        >
                          Download
                        </Button>
                      </Group>
                    </Group>
                  </Card>
                ))}
              </Stack>
            )}

            <Divider />

            <form onSubmit={handleUploadAttachment}>
              <Stack gap="sm">
                <FileInput
                  label="Choose file to upload"
                  placeholder="Select a file..."
                  value={file}
                  onChange={setFile}
                  accept="image/*,application/pdf,.doc,.docx,.txt"
                  required
                />
                <Button type="submit" loading={uploadAttachmentMutation.isPending} disabled={!file}>
                  {uploadAttachmentMutation.isPending ? 'Uploading...' : 'Upload Attachment'}
                </Button>
              </Stack>
            </form>
          </Stack>
        </Card>
      </Stack>
    </div>
  )
}
