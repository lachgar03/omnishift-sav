import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { ticketsApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import { getStatusColor, getPriorityColor } from '@/utils/statusUtils'
import type { TicketResponse } from '@/types'
import { TicketStatus } from '@/constants/roles'

export default function AssignedTickets() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery<TicketResponse[]>({
    queryKey: ['tickets', 'assigned-to-me'],
    queryFn: () => ticketsApi.getAssignedToMe(),
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: number; status: TicketStatus }) =>
      ticketsApi.update(ticketId, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
    onError: (error: unknown) => {
      console.error('Failed to update ticket status:', error)
    },
  })

  const handleStartWorking = (ticketId: number) => {
    updateStatusMutation.mutate({
      ticketId,
      status: TicketStatus.IN_PROGRESS,
    })
  }

  if (isLoading) {
    return (
      <div className="assigned-tickets">
        <h1>Tickets Assigned to Me</h1>
        <div>Loading assigned tickets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="assigned-tickets">
        <h1>Tickets Assigned to Me</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error loading tickets: {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }
  const sortedTickets = tickets?.sort((a: TicketResponse, b: TicketResponse) => {
    // Sort by priority first, then by creation date
    const priorityDiff =
      (priorityOrder[a.priority as keyof typeof priorityOrder] || 5) -
      (priorityOrder[b.priority as keyof typeof priorityOrder] || 5)
    if (priorityDiff !== 0) return priorityDiff
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  return (
    <div className="assigned-tickets">
      <h1>Tickets Assigned to Me</h1>

      {sortedTickets && sortedTickets.length > 0 && (
        <div
          className="tickets-summary"
          style={{
            marginBottom: '20px',
            padding: '15px',
            backgroundColor: '#e7f3ff',
            borderRadius: '8px',
            border: '1px solid #bee5eb',
          }}
        >
          <strong>{sortedTickets.length}</strong> ticket{sortedTickets.length !== 1 ? 's' : ''}{' '}
          assigned to you
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
                  <button
                    onClick={() => navigate({ to: `/tickets/${ticket.id}` })}
                    style={{
                      textDecoration: 'none',
                      color: '#007bff',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 'inherit',
                      fontFamily: 'inherit',
                    }}
                  >
                    #{ticket.id} - {ticket.title}
                  </button>
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

            {ticket.assignedTeam && (
              <div className="ticket-team" style={{ marginBottom: '15px' }}>
                <strong>Team:</strong>
                <span
                  style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                  }}
                >
                  {ticket.assignedTeam}
                </span>
              </div>
            )}

            <div
              className="ticket-actions"
              style={{
                display: 'flex',
                gap: '10px',
                paddingTop: '15px',
                borderTop: '1px solid #dee2e6',
              }}
            >
              <button
                style={{
                  padding: '8px 15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onClick={() => navigate({ to: `/tickets/${ticket.id}` })}
              >
                View Details
              </button>

              {ticket.status === 'ASSIGNED' && (
                <button
                  style={{
                    padding: '8px 15px',
                    backgroundColor: '#28a745',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                  onClick={() => handleStartWorking(ticket.id)}
                  disabled={updateStatusMutation.isPending}
                >
                  {updateStatusMutation.isPending ? 'Updating...' : 'Start Working'}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {sortedTickets && sortedTickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>No tickets assigned</h3>
          <p>You don't have any tickets assigned to you at the moment.</p>
        </div>
      )}
    </div>
  )
}
