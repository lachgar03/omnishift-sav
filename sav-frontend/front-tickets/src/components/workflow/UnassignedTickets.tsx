import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi, usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import { getStatusColor, getPriorityColor } from '@/utils/statusUtils'
import { Team } from '@/constants/roles'
import type { TicketResponse, UserResponse, AssignTeamRequest, AssignUserRequest } from '@/types'

export default function UnassignedTickets() {
  const queryClient = useQueryClient()
  const [actionError, setActionError] = useState<string>('')

  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery<TicketResponse[]>({
    queryKey: ['tickets', 'unassigned'],
    queryFn: () => ticketsApi.getByStatus('OPEN'),
  })

  const { data: technicians } = useQuery<UserResponse[]>({
    queryKey: ['technicians'],
    queryFn: () => usersApi.getTechnicians(),
  })

  const assignTeamMutation = useMutation({
    mutationFn: ({ ticketId, request }: { ticketId: number; request: AssignTeamRequest }) =>
      ticketsApi.assignTeam(ticketId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setActionError('')
    },
    onError: (error: unknown) => {
      setActionError(getErrorMessage(error))
    },
  })

  const assignUserMutation = useMutation({
    mutationFn: ({ ticketId, request }: { ticketId: number; request: AssignUserRequest }) =>
      ticketsApi.assignUser(ticketId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
      setActionError('')
    },
    onError: (error: unknown) => {
      setActionError(getErrorMessage(error))
    },
  })

  const handleTeamAssignment = (ticketId: number, team: Team) => {
    assignTeamMutation.mutate({ ticketId, request: { team } })
  }

  const handleUserAssignment = (ticketId: number, userId: string) => {
    assignUserMutation.mutate({ ticketId, request: { userId } })
  }

  if (isLoading) {
    return (
      <div className="unassigned-tickets">
        <h1>Unassigned Tickets</h1>
        <div>Loading unassigned tickets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="unassigned-tickets">
        <h1>Unassigned Tickets</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error loading tickets: {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  // Filter for truly unassigned tickets
  const unassignedTickets = tickets?.filter(
    (ticket: TicketResponse) => !ticket.assignedUserId && !ticket.assignedTeam,
  )

  const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }
  const sortedTickets = unassignedTickets?.sort((a: TicketResponse, b: TicketResponse) => {
    const priorityDiff = (priorityOrder[a.priority as keyof typeof priorityOrder] || 5) - (priorityOrder[b.priority as keyof typeof priorityOrder] || 5)
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="unassigned-tickets">
      <h1>Unassigned Tickets</h1>

      {actionError && (
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
          {actionError}
        </div>
      )}

      {sortedTickets && sortedTickets.length > 0 && (
        <div
          className="tickets-summary"
          style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeaa7',
          }}
        >
          <strong>{sortedTickets.length}</strong> unassigned ticket
          {sortedTickets.length !== 1 ? 's' : ''} requiring attention
        </div>
      )}

      <div
        className="tickets-grid"
        style={{
          display: 'grid',
          gap: '20px',
        }}
      >
        {sortedTickets?.map((ticket: TicketResponse) => (
          <div
            key={ticket.id}
            className="ticket-card"
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#fff',
              borderLeft: `4px solid ${getPriorityColor(ticket.priority)}`,
            }}
          >
            <div
              className="ticket-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '15px',
              }}
            >
              <div>
                <h3 style={{ margin: '0 0 5px 0' }}>
                  <a
                    href={`/tickets/${ticket.id}`}
                    style={{ textDecoration: 'none', color: '#007bff' }}
                  >
                    #{ticket.id} - {ticket.title}
                  </a>
                </h3>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  Created: {formatDate(ticket.createdAt)}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ marginBottom: '5px' }}>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: getStatusColor(ticket.status),
                      color: 'white',
                    }}
                  >
                    {ticket.status}
                  </span>
                </div>
                <div>
                  <span
                    style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      backgroundColor: getPriorityColor(ticket.priority),
                      color: 'white',
                    }}
                  >
                    {ticket.priority}
                  </span>
                </div>
              </div>
            </div>

            <div className="ticket-content" style={{ marginBottom: '15px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Type:</div>
              <div style={{ marginBottom: '10px' }}>{ticket.type}</div>

              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Description:</div>
              <div
                style={{
                  color: '#666',
                  lineHeight: '1.4',
                  maxHeight: '60px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {ticket.description}
              </div>
            </div>

            <div
              className="assignment-actions"
              style={{
                paddingTop: '15px',
                borderTop: '1px solid #dee2e6',
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', fontSize: '16px' }}>Assign Ticket</h4>

              {/* Team Assignment */}
              <div style={{ marginBottom: '15px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  Assign to Team:
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#17a2b8',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    onClick={() => handleTeamAssignment(ticket.id, Team.SUPPORT)}
                    disabled={assignTeamMutation.isPending}
                  >
                    Support Team
                  </button>
                  <button
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#6f42c1',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      fontSize: '12px',
                    }}
                    onClick={() => handleTeamAssignment(ticket.id, Team.DEVELOPMENT)}
                    disabled={assignTeamMutation.isPending}
                  >
                    Development Team
                  </button>
                </div>
              </div>

              {/* User Assignment */}
              <div style={{ marginBottom: '15px' }}>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '5px',
                    fontWeight: 'bold',
                    fontSize: '14px',
                  }}
                >
                  Assign to Technician:
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '4px',
                    border: '1px solid #ccc',
                  }}
                  onChange={(e) => {
                    if (e.target.value) {
                      handleUserAssignment(ticket.id, e.target.value)
                    }
                  }}
                  value=""
                  disabled={assignUserMutation.isPending}
                >
                  <option value="">Select a technician...</option>
                  {technicians?.map((tech: UserResponse) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.fullName || `${tech.firstName} ${tech.lastName}`}
                    </option>
                  ))}
                </select>
              </div>

              {/* View Details */}
              <button
                style={{
                  width: '100%',
                  padding: '8px 15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onClick={() => (window.location.href = `/tickets/${ticket.id}`)}
              >
                View Full Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {sortedTickets && sortedTickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>No unassigned tickets</h3>
          <p>All tickets have been assigned to teams or technicians.</p>
        </div>
      )}
    </div>
  )
}
