import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi } from '@/api'
import type { CreateTicketRequest, TicketResponse } from '@/types'
import { TicketType, Priority } from '@/constants/roles'
import { useNavigate } from '@tanstack/react-router'
import { getErrorMessage, getValidationErrors } from '@/utils/errorUtils'

interface TicketFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export const TicketForm = ({ onSuccess, onCancel }: TicketFormProps) => {
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

  const createTicketMutation = useMutation({
    mutationFn: ticketsApi.create,
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
      setApiError(getErrorMessage(error))
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
    <div className="ticket-form">
      <h2>Create New Support Ticket</h2>

      {apiError && (
        <div
          className="error-banner"
          style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            border: '1px solid #fcc',
          }}
        >
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="form">
        <div className="form-group">
          <label htmlFor="title" className="form-label">
            Title *
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => handleInputChange('title', e.target.value)}
            className={`form-input ${errors.title ? 'error' : ''}`}
            placeholder="Brief description of the issue or request"
            maxLength={100}
          />
          {errors.title && <span className="error-message">{errors.title}</span>}
          <span className="char-count">{formData.title.length}/100</span>
        </div>

        <div className="form-group">
          <label htmlFor="type" className="form-label">
            Ticket Type *
          </label>
          <select
            id="type"
            value={formData.type}
            onChange={(e) => handleInputChange('type', e.target.value as TicketType)}
            className="form-select"
          >
            {ticketTypeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="priority" className="form-label">
            Priority *
          </label>
          <select
            id="priority"
            value={formData.priority}
            onChange={(e) => handleInputChange('priority', e.target.value as Priority)}
            className="form-select"
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label} - {option.description}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="description" className="form-label">
            Description
          </label>
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            className={`form-textarea ${errors.description ? 'error' : ''}`}
            placeholder="Detailed description of the issue, steps to reproduce, expected behavior, etc."
            rows={6}
            maxLength={1000}
          />
          {errors.description && <span className="error-message">{errors.description}</span>}
          <span className="char-count">{formData.description?.length || 0}/1000</span>
        </div>

        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
            disabled={createTicketMutation.isPending}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={createTicketMutation.isPending}
          >
            {createTicketMutation.isPending ? 'Creating...' : 'Create Ticket'}
          </button>
        </div>

        {createTicketMutation.isError && (
          <div className="error-banner">Failed to create ticket. Please try again.</div>
        )}
      </form>
    </div>
  )
}
