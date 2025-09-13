import React from 'react'
import type { Ticket } from '../types/api'
import { TicketStatus, Priority } from '../types/api'
import { formatDate } from '../utils/formatDate'

interface TicketCardProps {
  ticket: Ticket
  onStatusChange?: (ticketId: number, newStatus: TicketStatus) => void
  onAssign?: (ticketId: number, userId: string) => void
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, onStatusChange, onAssign }) => {
  const getStatusColor = (status: TicketStatus) => {
    switch (status) {
      case TicketStatus.OPEN:
        return 'bg-blue-100 text-blue-800'
      case TicketStatus.ASSIGNED:
        return 'bg-yellow-100 text-yellow-800'
      case TicketStatus.IN_PROGRESS:
        return 'bg-orange-100 text-orange-800'
      case TicketStatus.RESOLVED:
        return 'bg-green-100 text-green-800'
      case TicketStatus.CLOSED:
        return 'bg-gray-100 text-gray-800'
      case TicketStatus.REOPENED:
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.CRITICAL:
        return 'bg-red-100 text-red-800'
      case Priority.HIGH:
        return 'bg-orange-100 text-orange-800'
      case Priority.MEDIUM:
        return 'bg-yellow-100 text-yellow-800'
      case Priority.LOW:
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="ticket-card">
      <div className="ticket-header">
        <h3 className="ticket-title">{ticket.title}</h3>
        <div className="ticket-badges">
          <span className={`badge ${getStatusColor(ticket.status)}`}>{ticket.status}</span>
          <span className={`badge ${getPriorityColor(ticket.priority)}`}>{ticket.priority}</span>
        </div>
      </div>

      <div className="ticket-content">
        <p className="ticket-description">{ticket.description}</p>

        <div className="ticket-meta">
          <div className="ticket-info">
            <span>Type: {ticket.type}</span>
            {ticket.assignedTeam && <span>Team: {ticket.assignedTeam}</span>}
            {ticket.assignedUserId && <span>Assigned to: {ticket.assignedUserId}</span>}
          </div>

          <div className="ticket-dates">
            <span>Created: {formatDate(ticket.createdAt)}</span>
            <span>Updated: {formatDate(ticket.updatedAt)}</span>
          </div>
        </div>
      </div>

      <div className="ticket-actions">
        {onStatusChange && (
          <select
            value={ticket.status}
            onChange={(e) => onStatusChange(ticket.id, e.target.value as TicketStatus)}
          >
            {Object.values(TicketStatus).map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        )}

        {onAssign && (
          <button onClick={() => onAssign(ticket.id, 'user-id')} className="assign-button">
            Assign
          </button>
        )}
      </div>
    </div>
  )
}
