import { useQuery } from '@tanstack/react-query'
import { ticketsApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import { getStatusColor, getPriorityColor } from '@/utils/statusUtils'
import { Priority } from '@/constants/roles'
import type { TicketResponse } from '@/types'

export default function HighPriorityTickets() {
  const {
    data: highTickets,
    isLoading: isLoadingHigh,
    error: highError,
  } = useQuery<TicketResponse[]>({
    queryKey: ['tickets', 'priority', 'HIGH'],
    queryFn: () => ticketsApi.getByPriority(Priority.HIGH),
  })

  const {
    data: criticalTickets,
    isLoading: isLoadingCritical,
    error: criticalError,
  } = useQuery<TicketResponse[]>({
    queryKey: ['tickets', 'priority', 'CRITICAL'],
    queryFn: () => ticketsApi.getByPriority(Priority.CRITICAL),
  })

  const isLoading = isLoadingHigh || isLoadingCritical
  const error = highError || criticalError

  if (isLoading) {
    return (
      <div className="high-priority-tickets">
        <h1>High Priority Tickets</h1>
        <div>Loading high priority tickets...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="high-priority-tickets">
        <h1>High Priority Tickets</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error loading tickets: {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  // Combine and sort tickets by priority and creation date
  const allHighPriorityTickets = [...(criticalTickets || []), ...(highTickets || [])].sort(
    (a, b) => {
      // Critical first, then high, then by creation date
      if (a.priority === 'CRITICAL' && b.priority !== 'CRITICAL') return -1
      if (b.priority === 'CRITICAL' && a.priority !== 'CRITICAL') return 1
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    },
  )

  const openHighPriority = allHighPriorityTickets.filter(
    (t) => t.status === 'OPEN' || t.status === 'ASSIGNED',
  )
  const inProgressHighPriority = allHighPriorityTickets.filter((t) => t.status === 'IN_PROGRESS')

  return (
    <div className="high-priority-tickets">
      <h1>High Priority Tickets</h1>

      <div
        className="priority-summary"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          marginBottom: '30px',
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
            {criticalTickets?.length || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Critical Priority</div>
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
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#fd7e14' }}>
            {highTickets?.length || 0}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>High Priority</div>
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
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#e83e8c' }}>
            {openHighPriority.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>Awaiting Assignment</div>
        </div>

        <div
          style={{
            padding: '15px',
            backgroundColor: '#d1ecf1',
            borderRadius: '8px',
            border: '1px solid #bee5eb',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#0c5460' }}>
            {inProgressHighPriority.length}
          </div>
          <div style={{ fontSize: '14px', color: '#666' }}>In Progress</div>
        </div>
      </div>

      {/* Critical Tickets Section */}
      {criticalTickets && criticalTickets.length > 0 && (
        <div className="critical-section" style={{ marginBottom: '30px' }}>
          <h2
            style={{
              color: '#dc3545',
              borderBottom: '2px solid #dc3545',
              paddingBottom: '10px',
            }}
          >
            🚨 Critical Priority Tickets
          </h2>
          <div className="tickets-grid" style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
            {criticalTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} isCritical={true} />
            ))}
          </div>
        </div>
      )}

      {/* High Priority Tickets Section */}
      {highTickets && highTickets.length > 0 && (
        <div className="high-section">
          <h2
            style={{
              color: '#fd7e14',
              borderBottom: '2px solid #fd7e14',
              paddingBottom: '10px',
            }}
          >
            ⚠️ High Priority Tickets
          </h2>
          <div className="tickets-grid" style={{ display: 'grid', gap: '15px', marginTop: '15px' }}>
            {highTickets.map((ticket) => (
              <TicketCard key={ticket.id} ticket={ticket} isCritical={false} />
            ))}
          </div>
        </div>
      )}

      {allHighPriorityTickets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>No high priority tickets</h3>
          <p>There are currently no high or critical priority tickets in the system.</p>
        </div>
      )}
    </div>
  )
}

interface TicketCardProps {
  ticket: TicketResponse
  isCritical: boolean
}

function TicketCard({ ticket, isCritical }: TicketCardProps) {
  return (
    <div
      className="ticket-card"
      style={{
        border: '1px solid #ddd',
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: isCritical ? '#ffeaea' : '#fff8e1',
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
            <a href={`/tickets/${ticket.id}`} style={{ textDecoration: 'none', color: '#007bff' }}>
              #{ticket.id} - {ticket.title}
            </a>
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
                backgroundColor: getPriorityColor(ticket.priority),
                color: 'white',
                fontWeight: 'bold',
              }}
            >
              {ticket.priority}
            </span>
          </div>
        </div>
      </div>

      <div className="ticket-content" style={{ marginBottom: '15px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Type:</div>
            <div style={{ marginBottom: '10px' }}>{ticket.type}</div>
          </div>

          {ticket.assignedTeam && (
            <div>
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Team:</div>
              <div>
                <span
                  style={{
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
            </div>
          )}
        </div>

        <div style={{ marginTop: '10px' }}>
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

        {!ticket.assignedUserId && !ticket.assignedTeam && (
          <button
            style={{
              padding: '8px 15px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '14px',
            }}
            onClick={() => (window.location.href = `/workflow/unassigned`)}
          >
            Assign Now
          </button>
        )}
      </div>
    </div>
  )
}
