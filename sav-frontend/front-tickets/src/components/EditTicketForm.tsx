import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Container,
  Title,
  Text,
  Card,
  Stack,
  TextInput,
  Textarea,
  Button,
  Group,
  Alert,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { ticketsApi } from '@/api'
import type { TicketResponse, UpdateTicketRequest } from '@/types'
import { getErrorMessage, getValidationErrors } from '@/utils/errorUtils'

interface EditTicketFormProps {
  ticket: TicketResponse
  onSuccess?: () => void
  onCancel?: () => void
}

export const EditTicketForm = ({ ticket, onSuccess, onCancel }: EditTicketFormProps) => {
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState({
    title: ticket.title,
    description: ticket.description || '',
  })

  const [errors, setErrors] = useState<Partial<{ title: string; description: string }>>({})
  const [apiError, setApiError] = useState<string>('')

  const updateTicketMutation = useMutation({
    mutationFn: (data: UpdateTicketRequest) => ticketsApi.update(ticket.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ticket', ticket.id] })
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
      setApiError('')
      if (onSuccess) {
        onSuccess()
      }
    },
    onError: (error: unknown) => {
      console.error('Failed to update ticket:', error)

      // Handle validation errors
      const validationErrors = getValidationErrors(error)
      if (validationErrors) {
        setErrors(validationErrors as Partial<{ title: string; description: string }>)
      }

      // Set general error message
      setApiError(getErrorMessage(error))
    },
  })

  const validateForm = (): boolean => {
    const newErrors: Partial<{ title: string; description: string }> = {}

    if (!formData.title.trim()) {
      newErrors.title = 'Title is required'
    }

    if (formData.title.length > 100) {
      newErrors.title = 'Title must be less than 100 characters'
    }

    if (formData.description && formData.description.length > 1000) {
      newErrors.description = 'Description must be less than 1000 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    updateTicketMutation.mutate({
      title: formData.title,
      description: formData.description,
    })
  }

  const handleInputChange = (field: 'title' | 'description', value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <Container size="md" py="md">
      <Card withBorder>
        <Stack gap="md">
          <Title order={3}>Edit Ticket #{ticket.id}</Title>

          {apiError && (
            <Alert icon={<IconAlertCircle size="1rem" />} color="red" title="Error">
              {apiError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Stack gap="md">
              <TextInput
                label="Title"
                placeholder="Brief description of the issue or request"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                error={errors.title}
                maxLength={100}
                required
                rightSection={
                  <Text size="xs" c="dimmed">
                    {formData.title.length}/100
                  </Text>
                }
              />

              <Textarea
                label="Description"
                placeholder="Detailed description of the issue or request"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                error={errors.description}
                rows={6}
                maxLength={1000}
                rightSection={
                  <Text size="xs" c="dimmed">
                    {formData.description.length}/1000
                  </Text>
                }
              />

              <Group justify="flex-end" gap="sm">
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={updateTicketMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" loading={updateTicketMutation.isPending}>
                  {updateTicketMutation.isPending ? 'Updating...' : 'Update Ticket'}
                </Button>
              </Group>
            </Stack>
          </form>
        </Stack>
      </Card>
    </Container>
  )
}
