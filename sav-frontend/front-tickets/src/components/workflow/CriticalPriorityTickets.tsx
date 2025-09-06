import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketsApi, usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import { getStatusColor } from '@/utils/statusUtils'
import { Priority, Team } from '@/constants/roles'
import type { TicketResponse, UserResponse, AssignTeamRequest, AssignUserRequest } from '@/types'

export default function CriticalPriorityTickets() {
  const queryClient = useQueryClient()

  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery<TicketResponse[]>({
    queryKey: ['tickets', 'priority', 'CRITICAL'],
    queryFn: () => ticketsApi.getByPriority(Priority.CRITICAL),
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
    },
  })

  const assignUserMutation = useMutation({
    mutationFn: ({ ticketId, request }: { ticketId: number; request: AssignUserRequest }) =>
      ticketsApi.assignUser(ticketId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tickets'] })
    },
  })

  if (isLoading) {
    return (
      <div className="critical-priority-tickets">
        <h1>🚨 Critical Priority Tickets</h1>
        <div>Loading critical tickets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="critical-priority-tickets">
        <h1>🚨 Critical Priority Tickets</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error loading tickets: {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  const sortedTickets = tickets?.sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  )

  const unassignedCritical =
    sortedTickets?.filter((t) => !t.assignedUserId && !t.assignedTeam) || []
  const assignedCritical = sortedTickets?.filter((t) => t.assignedUserId || t.assignedTeam) || []

  return (
    <div className="critical-priority-tickets">
      <div
        className="header"
        style={{
          backgroundColor: '#f8d7da',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid #f5c6cb',
          marginBottom: '30px',
        }}
      >
        <h1 style={{ margin: '0 0 10px 0', color: '#721c24' }}>🚨 Critical Priority Tickets</h1>
        <p style={{ margin: 0, color: '#721c24' }}>
          These tickets require immediate attention and should be resolved as quickly as possible.
        </p>
      </div>

      <div
        className="critical-summary"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px',
        }}
      >
        <div
          style={{
            padding: '20px',
            backgroundColor: '#fee',
            borderRadius: '8px',
            border: '2px solid #dc3545',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc3545' }}>
            {sortedTickets?.length || 0}
          </div>
          <div style={{ fontSize: '16px', color: '#721c24', fontWeight: 'bold' }}>
            Total Critical
          </div>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: '#fff5f5',
            borderRadius: '8px',
            border: '1px solid #fed7d7',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#e53e3e' }}>
            {unassignedCritical.length}
          </div>
          <div style={{ fontSize: '16px', color: '#721c24' }}>Unassigned</div>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: '#fff5f5',
            borderRadius: '8px',
            border: '1px solid #fed7d7',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3182ce' }}>
            {assignedCritical.length}
          </div>
          <div style={{ fontSize: '16px', color: '#721c24' }}>Assigned</div>
        </div>
      </div>

      {/* Unassigned Critical Tickets - Top Priority */}
      {unassignedCritical.length > 0 && (
        <div className="unassigned-section" style={{ marginBottom: '30px' }}>
          <h2
            style={{
              color: '#dc3545',
              backgroundColor: '#f8d7da',
              padding: '15px',
              borderRadius: '8px',
              border: '1px solid #f5c6cb',
              margin: '0 0 20px 0',
            }}
          >
            ⚠️ IMMEDIATE ACTION REQUIRED - Unassigned Critical Tickets
          </h2>

          <div className="tickets-grid" style={{ display: 'grid', gap: '20px' }}>
            {unassignedCritical.map((ticket) => (
              <CriticalTicketCard
                key={ticket.id}
                ticket={ticket}
                technicians={technicians}
                onAssignTeam={(team) =>
                  assignTeamMutation.mutate({ ticketId: ticket.id, request: { team } })
                }
                onAssignUser={(userId) =>
                  assignUserMutation.mutate({ ticketId: ticket.id, request: { userId } })
                }
                isUnassigned={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* Assigned Critical Tickets */}
      {assignedCritical.length > 0 && (
        <div className="assigned-section">
          <h2
            style={{
              color: '#dc3545',
              borderBottom: '2px solid #dc3545',
              paddingBottom: '10px',
            }}
          >
            Assigned Critical Tickets
          </h2>

          <div className="tickets-grid" style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
            {assignedCritical.map((ticket) => (
              <CriticalTicketCard
                key={ticket.id}
                ticket={ticket}
                technicians={technicians}
                onAssignTeam={() => {}}
                onAssignUser={() => {}}
                isUnassigned={false}
              />
            ))}
          </div>
        </div>
      )}

      {sortedTickets && sortedTickets.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '60px',
            backgroundColor: '#d4edda',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
          }}
        >
          <h3 style={{ color: '#155724', margin: '0 0 10px 0' }}>
            ✅ No Critical Priority Tickets
          </h3>
          <p style={{ color: '#155724', margin: 0 }}>
            Great job! There are currently no critical priority tickets in the system.
          </p>
        </div>
      )}
    </div>
  )
}

interface CriticalTicketCardProps {
  ticket: TicketResponse
  technicians?: UserResponse[]
  onAssignTeam: (team: Team) => void
  onAssignUser: (userId: string) => void
  isUnassigned: boolean
}

function CriticalTicketCard({
  ticket,
  technicians,
  onAssignTeam,
  onAssignUser,
  isUnassigned,
}: CriticalTicketCardProps) {
  return (
    <div
      className="critical-ticket-card"
      style={{
        border: '2px solid #dc3545',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: isUnassigned ? '#ffeaea' : '#fff',
        borderLeft: '6px solid #dc3545',
        boxShadow: isUnassigned ? '0 4px 8px rgba(220, 53, 69, 0.2)' : '0 2px 4px rgba(0,0,0,0.1)',
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
          <h3 style={{ margin: '0 0 5px 0', color: '#dc3545' }}>
            🚨 #{ticket.id} - {ticket.title}
          </h3>
          <div style={{ fontSize: '14px', color: '#666' }}>
            Created: {formatDate(ticket.createdAt)}
          </div>
          {ticket.updatedAt !== ticket.createdAt && (
            <div style={{ fontSize: '12px', color: '#999' }}>
              Updated: {formatDate(ticket.updatedAt)}
            </div>
          )}
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
                backgroundColor: '#dc3545',
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              CRITICAL
            </span>
          </div>
        </div>
      </div>

      <div className="ticket-content" style={{ marginBottom: '15px' }}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px',
            marginBottom: '10px',
          }}
        >
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Type:</div>
            <div>{ticket.type}</div>
          </div>

          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Assignment:</div>
            <div>
              {ticket.assignedTeam && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: '#6c757d',
                    color: 'white',
                    marginRight: '5px',
                  }}
                >
                  {ticket.assignedTeam}
                </span>
              )}
              {ticket.assignedUserId && (
                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: '#007bff',
                    color: 'white',
                  }}
                >
                  Assigned
                </span>
              )}
              {!ticket.assignedTeam && !ticket.assignedUserId && (
                <span style={{ color: '#dc3545', fontWeight: 'bold' }}>UNASSIGNED</span>
              )}
            </div>
          </div>
        </div>

        <div>
          <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Description:</div>
          <div
            style={{
              color: '#666',
              lineHeight: '1.4',
              backgroundColor: '#f8f9fa',
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #dee2e6',
            }}
          >
            {ticket.description}
          </div>
        </div>
      </div>

      {isUnassigned && (
        <div
          className="urgent-assignment"
          style={{
            backgroundColor: '#f8d7da',
            padding: '15px',
            borderRadius: '4px',
            border: '1px solid #f5c6cb',
            marginBottom: '15px',
          }}
        >
          <h4 style={{ margin: '0 0 10px 0', color: '#721c24' }}>URGENT: Assign Immediately</h4>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '5px',
                  fontWeight: 'bold',
                  fontSize: '14px',
                }}
              >
                Quick Team Assignment:
              </label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  onClick={() => onAssignTeam(Team.SUPPORT)}
                >
                  SUPPORT TEAM
                </button>
                <button
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px',
                    fontWeight: 'bold',
                  }}
                  onClick={() => onAssignTeam(Team.DEVELOPMENT)}
                >
                  DEV TEAM
                </button>
              </div>
            </div>

            <div>
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
                  padding: '8px',
                  borderRadius: '4px',
                  border: '2px solid #dc3545',
                  backgroundColor: '#fff',
                }}
                onChange={(e) => {
                  if (e.target.value) {
                    onAssignUser(e.target.value)
                  }
                }}
                value=""
              >
                <option value="">Select technician...</option>
                {technicians?.map((tech) => (
                  <option key={tech.id} value={tech.id}>
                    {tech.fullName || `${tech.firstName} ${tech.lastName}`}
                  </option>
                ))}
              </select>
            </div>
          </div>
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
            flex: 1,
            padding: '10px 15px',
            backgroundColor: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 'bold',
          }}
          onClick={() => (window.location.href = `/tickets/${ticket.id}`)}
        >
          VIEW CRITICAL TICKET
        </button>
      </div>
    </div>
  )
}
