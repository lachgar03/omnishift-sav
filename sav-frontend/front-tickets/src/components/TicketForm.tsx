import { useState, useEffect } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Card,
  Stack,
  TextInput,
  Select,
  Textarea,
  Button,
  Group,
  Alert,
  Text,
  Title,
} from '@mantine/core'
import { IconAlertCircle } from '@tabler/icons-react'
import { usersApi } from '@/api'
import { ticketService } from '@/services'
import type { TicketResponse } from '@/types'
import { CreateTicketRequest, TicketType, Priority } from '@/types/api'
import { useNavigate } from '@tanstack/react-router'
import { getErrorMessage, getValidationErrors } from '@/utils/errorUtils'
import { ErrorBoundary } from './ErrorBoundary'

interface TicketFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

const TicketFormComponent = ({ onSuccess, onCancel }: TicketFormProps) => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<CreateTicketRequest>({
    title: '',
    description: '',
    type: TicketType.ASSISTANCE,
    priority: Priority.MEDIUM,
  })

  const [errors, setErrors] = useState<Partial<CreateTicketRequest>>({})
  const [apiError, setApiError] = useState<string>('')
  const [isSyncing, setIsSyncing] = useState(false)

  // Ensure user exists before allowing ticket creation
  useEffect(() => {
    const ensureUserExists = async () => {
      // Check if we've already tried user sync recently to prevent infinite loops
      const lastSyncAttempt = sessionStorage.getItem('lastUserSyncAttempt')
      const now = Date.now()
      const syncCooldown = 30000 // 30 seconds cooldown

      if (lastSyncAttempt && now - parseInt(lastSyncAttempt) < syncCooldown) {
        console.log('User sync cooldown active, skipping sync in TicketForm')
        setIsSyncing(false)
        return
      }

      try {
        setIsSyncing(true)
        const exists = await usersApi.checkExists()
        if (!exists.exists) {
          console.log('User not found, syncing before ticket creation...')
          sessionStorage.setItem('lastUserSyncAttempt', now.toString())

          try {
            await usersApi.forceSync()
            console.log('User sync successful')
          } catch {
            console.warn('Force sync failed, trying minimal user creation...')
            try {
              await usersApi.createMinimal()
              console.log('Minimal user creation successful')
            } catch (minimalError) {
              console.error('Both force sync and minimal user creation failed:', minimalError)
              setApiError('User sync failed. Please refresh the page and try again.')
            }
          }
        }
      } catch (error) {
        console.error('Failed to ensure user exists:', error)
        setApiError('Failed to sync user. Please refresh the page and try again.')
      } finally {
        setIsSyncing(false)
      }
    }

    ensureUserExists()
  }, [])

  const createTicketMutation = useMutation({
    mutationFn: (data: CreateTicketRequest) => {
      const apiRequest: CreateTicketRequest = {
        title: data.title,
        description: data.description,
        type: data.type,
        priority: data.priority,
      }
      return ticketService.createTicket(apiRequest)
    },
    onSuccess: (data: TicketResponse) => {
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      queryClient.invalidateQueries({ queryKey: ['my-tickets'] })
      setApiError('') // Clear any previous errors

      if (onSuccess) {
        onSuccess()
      } else {
        // Redirect to the created ticket
        navigate({ to: `/tickets/${data.id}` })
      }
    },
    onError: (error: unknown) => {
      console.error('Failed to create ticket:', error)

      // Handle validation errors
      const validationErrors = getValidationErrors(error)
      if (validationErrors) {
        setErrors(validationErrors as Partial<CreateTicketRequest>)
      }

      // Set general error message
      const errorMessage = getErrorMessage(error)
      setApiError(errorMessage)

      // If it's a user not found error, suggest logging out and back in
      if (errorMessage.includes('user') && errorMessage.includes('not found')) {
        setApiError('User not found. Please try logging out and logging back in.')
      }
    },
  })

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateTicketRequest> = {}

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

    // Ensure user is synced before creating ticket
    if (isSyncing) {
      setApiError('Please wait while we sync your user account...')
      return
    }

    createTicketMutation.mutate(formData)
  }

  const handleInputChange = (
    field: keyof CreateTicketRequest,
    value: string | TicketType | Priority,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const ticketTypeOptions = [
    { value: TicketType.BUG, label: 'Bug Report' },
    { value: TicketType.FEATURE_REQUEST, label: 'Feature Request' },
    { value: TicketType.ASSISTANCE, label: 'General Assistance' },
    { value: TicketType.INCIDENT, label: 'Incident' },
    { value: TicketType.RECLAMATION, label: 'Reclamation' },
    { value: TicketType.RELANCE, label: 'Relance' },
  ]

  const priorityOptions = [
    { value: Priority.LOW, label: 'Low', description: 'Minor issues, general questions' },
    { value: Priority.MEDIUM, label: 'Medium', description: 'Standard support requests' },
    { value: Priority.HIGH, label: 'High', description: 'Issues affecting productivity' },
    {
      value: Priority.CRITICAL,
      label: 'Critical',
      description: 'System down, urgent business impact',
    },
  ]

  return (
    <Card withBorder>
      <Stack gap="md">
        <Title order={2}>Create New Support Ticket</Title>

        {apiError && (
          <Alert icon={<IconAlertCircle size="1rem" />} color="red" title="Error">
            {apiError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {isSyncing && (
              <Alert
                icon={<IconAlertCircle size="1rem" />}
                color="blue"
                title="Syncing User Account"
              >
                Please wait while we sync your user account with the server...
              </Alert>
            )}

            <TextInput
              label="Title"
              placeholder="Brief description of the issue or request"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              error={errors.title}
              maxLength={100}
              required
              disabled={isSyncing}
              rightSection={
                <Text size="xs" c="dimmed">
                  {formData.title.length}/100
                </Text>
              }
            />

            <Select
              label="Ticket Type"
              value={formData.type}
              onChange={(value) => handleInputChange('type', value as TicketType)}
              data={ticketTypeOptions}
              required
              disabled={isSyncing}
            />

            <Select
              label="Priority"
              value={formData.priority}
              onChange={(value) => handleInputChange('priority', value as Priority)}
              data={priorityOptions.map((option) => ({
                value: option.value,
                label: `${option.label} - ${option.description}`,
              }))}
              required
              disabled={isSyncing}
            />

            <Textarea
              label="Description"
              placeholder="Detailed description of the issue, steps to reproduce, expected behavior, etc."
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              error={errors.description}
              rows={6}
              maxLength={1000}
              disabled={isSyncing}
              rightSection={
                <Text size="xs" c="dimmed">
                  {formData.description?.length || 0}/1000
                </Text>
              }
            />

            <Group justify="flex-end" gap="sm">
              {onCancel && (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  disabled={createTicketMutation.isPending}
                >
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                loading={createTicketMutation.isPending || isSyncing}
                disabled={createTicketMutation.isPending || isSyncing}
              >
                {isSyncing
                  ? 'Syncing...'
                  : createTicketMutation.isPending
                    ? 'Creating...'
                    : 'Create Ticket'}
              </Button>
            </Group>

            {createTicketMutation.isError && (
              <Alert icon={<IconAlertCircle size="1rem" />} color="red">
                Failed to create ticket. Please try again.
              </Alert>
            )}
          </Stack>
        </form>
      </Stack>
    </Card>
  )
}

export const TicketForm = (props: TicketFormProps) => (
  <ErrorBoundary>
    <TicketFormComponent {...props} />
  </ErrorBoundary>
)
