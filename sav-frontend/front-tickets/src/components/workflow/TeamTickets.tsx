import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { ticketsApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import { getStatusColor, getPriorityColor } from '@/utils/statusUtils'
// import { Team } from '@/constants/roles'
import type { TicketResponse } from '@/types'

export default function TeamTickets() {
  const { team } = useParams({ strict: false }) as { team: string }

  const {
    data: tickets,
    isLoading,
    error,
  } = useQuery<TicketResponse[]>({
    queryKey: ['tickets', 'team', team],
    queryFn: () => ticketsApi.getByTeam(team),
    enabled: !!team,
  })

  if (!team) {
    return (
      <div className="team-tickets">
        <h1>Team Tickets</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          No team specified.
        </div>
      </div>
    )
  }

  const teamName =
    team.toUpperCase() === 'SUPPORT'
      ? 'Support'
      : team.toUpperCase() === 'DEVELOPMENT'
        ? 'Development'
        : team

  if (isLoading) {
    return (
      <div className="team-tickets">
        <h1>{teamName} Team Tickets</h1>
        <div>Loading team tickets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="team-tickets">
        <h1>{teamName} Team Tickets</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error loading tickets: {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  // Group tickets by status
  const ticketsByStatus = {
    open: tickets?.filter((t) => t.status === 'OPEN') || [],
    assigned: tickets?.filter((t) => t.status === 'ASSIGNED') || [],
    inProgress: tickets?.filter((t) => t.status === 'IN_PROGRESS') || [],
    resolved: tickets?.filter((t) => t.status === 'RESOLVED') || [],
    closed: tickets?.filter((t) => t.status === 'CLOSED') || [],
  }

  // Group by priority
  const ticketsByPriority = {
    critical: tickets?.filter((t) => t.priority === 'CRITICAL') || [],
    high: tickets?.filter((t) => t.priority === 'HIGH') || [],
    medium: tickets?.filter((t) => t.priority === 'MEDIUM') || [],
    low: tickets?.filter((t) => t.priority === 'LOW') || [],
  }

  const teamColor = team.toUpperCase() === 'SUPPORT' ? '#17a2b8' : '#6f42c1'

  return (
    <div className="team-tickets">
      <div
        className="team-header"
        style={{
          backgroundColor: `${teamColor}15`,
          padding: '20px',
          borderRadius: '8px',
          border: `1px solid ${teamColor}40`,
          marginBottom: '30px',
        }}
      >
        <h1 style={{ margin: '0 0 10px 0', color: teamColor }}>{teamName} Team Tickets</h1>
        <p style={{ margin: 0, color: teamColor }}>
          Overview of all tickets assigned to the {teamName.toLowerCase()} team.
        </p>
      </div>

      {/* Team Statistics */}
      <div
        className="team-stats"
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
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            border: '1px solid #dee2e6',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: teamColor }}>
            {tickets?.length || 0}
          </div>
          <div style={{ fontSize: '16px', color: '#666' }}>Total Tickets</div>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: '#fff3cd',
            borderRadius: '8px',
            border: '1px solid #ffeaa7',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#856404' }}>
            {ticketsByStatus.open.length + ticketsByStatus.assigned.length}
          </div>
          <div style={{ fontSize: '16px', color: '#666' }}>Pending</div>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: '#d1ecf1',
            borderRadius: '8px',
            border: '1px solid #bee5eb',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#0c5460' }}>
            {ticketsByStatus.inProgress.length}
          </div>
          <div style={{ fontSize: '16px', color: '#666' }}>In Progress</div>
        </div>

        <div
          style={{
            padding: '20px',
            backgroundColor: '#d4edda',
            borderRadius: '8px',
            border: '1px solid #c3e6cb',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#155724' }}>
            {ticketsByStatus.resolved.length + ticketsByStatus.closed.length}
          </div>
          <div style={{ fontSize: '16px', color: '#666' }}>Completed</div>
        </div>
      </div>

      {/* Priority Breakdown */}
      <div className="priority-breakdown" style={{ marginBottom: '30px' }}>
        <h3>Priority Breakdown</h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: '10px',
          }}
        >
          <div
            style={{
              padding: '15px',
              backgroundColor: '#fee',
              borderRadius: '8px',
              border: '1px solid #fcc',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
              {ticketsByPriority.critical.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Critical</div>
          </div>

          <div
            style={{
              padding: '15px',
              backgroundColor: '#fff8e1',
              borderRadius: '8px',
              border: '1px solid #ffe0b2',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fd7e14' }}>
              {ticketsByPriority.high.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>High</div>
          </div>

          <div
            style={{
              padding: '15px',
              backgroundColor: '#fff3cd',
              borderRadius: '8px',
              border: '1px solid #ffeaa7',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
              {ticketsByPriority.medium.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Medium</div>
          </div>

          <div
            style={{
              padding: '15px',
              backgroundColor: '#e7f3ff',
              borderRadius: '8px',
              border: '1px solid #bee5eb',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
              {ticketsByPriority.low.length}
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>Low</div>
          </div>
        </div>
      </div>

      {/* Active Tickets */}
      {(ticketsByStatus.open.length > 0 ||
        ticketsByStatus.assigned.length > 0 ||
        ticketsByStatus.inProgress.length > 0) && (
        <div className="active-tickets" style={{ marginBottom: '30px' }}>
          <h3>Active Tickets</h3>
          <div className="tickets-grid" style={{ display: 'grid', gap: '15px' }}>
            {[...ticketsByStatus.open, ...ticketsByStatus.assigned, ...ticketsByStatus.inProgress]
              .sort((a, b) => {
                const priorityOrder = { CRITICAL: 1, HIGH: 2, MEDIUM: 3, LOW: 4 }
                const priorityDiff =
                  (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5)
                if (priorityDiff !== 0) return priorityDiff
                return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
              })
              .map((ticket) => (
                <TeamTicketCard key={ticket.id} ticket={ticket} />
              ))}
          </div>
        </div>
      )}

      {/* Recently Completed */}
      {(ticketsByStatus.resolved.length > 0 || ticketsByStatus.closed.length > 0) && (
        <div className="completed-tickets">
          <h3>Recently Completed</h3>
          <div className="tickets-grid" style={{ display: 'grid', gap: '15px' }}>
            {[...ticketsByStatus.resolved, ...ticketsByStatus.closed]
              .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
              .slice(0, 5)
              .map((ticket) => (
                <TeamTicketCard key={ticket.id} ticket={ticket} />
              ))}
          </div>
        </div>
      )}

      {tickets && tickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>No tickets assigned to {teamName} team</h3>
          <p>This team doesn't have any tickets assigned at the moment.</p>
        </div>
      )}
    </div>
  )
}

interface TeamTicketCardProps {
  ticket: TicketResponse
}

function TeamTicketCard({ ticket }: TeamTicketCardProps) {
  return (
    <div
      className="team-ticket-card"
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
          <h4 style={{ margin: '0 0 5px 0' }}>
            <a href={`/tickets/${ticket.id}`} style={{ textDecoration: 'none', color: '#007bff' }}>
              #{ticket.id} - {ticket.title}
            </a>
          </h4>
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
        <div style={{ marginBottom: '10px' }}>
          <strong>Type:</strong> {ticket.type}
        </div>

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
          onClick={() => (window.location.href = `/tickets/${ticket.id}`)}
        >
          View Details
        </button>
      </div>
    </div>
  )
}
