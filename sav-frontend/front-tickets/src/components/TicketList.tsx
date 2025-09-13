import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/store/authStore'
import { ticketService } from '@/services/ticketService'
import type { TicketResponse } from '@/types'
import { TicketStatus, Priority, Team } from '@/constants/roles'
import {
  getStatusColor,
  getPriorityColor,
  getStatusLabel,
  getPriorityLabel,
  getTeamLabel,
} from '@/utils/statusUtils'
import { formatDate } from '@/utils/formatDate'

interface TicketListProps {
  title?: string
  tickets?: TicketResponse[]
  showFilters?: boolean
  showPagination?: boolean
  onTicketClick?: (ticket: TicketResponse) => void
  onPageChange?: (newPage: number) => void
  onPageSizeChange?: (newSize: number) => void
  currentPage?: number
  pageSize?: number
  totalPages?: number
  totalItems?: number
}

export const TicketList = ({
  title = 'Tickets',
  tickets: propTickets,
  showFilters = true,
  showPagination = true,
  onTicketClick,
  onPageChange,
  onPageSizeChange,
  currentPage,
  pageSize,
  totalPages,
  totalItems,
}: TicketListProps) => {
  const { isTechnician, isAdmin } = useAuthStore()

  // State for filters
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    team: '',
    searchTerm: '',
    page: currentPage ?? 0,
    size: pageSize ?? 20,
  })

  // Fetch tickets if not provided as props
  const { data: fetchedTicketsData, isLoading } = useQuery({
    queryKey: ['tickets', filters],
    queryFn: () => ticketService.getMyTickets(filters.page, filters.size),
    enabled: !propTickets,
  })

  const tickets = propTickets || fetchedTicketsData?.content || []

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 0 }))
    if (key === 'page' && onPageChange) {
      onPageChange(Number(value))
    }
  }

  const filteredTickets = tickets.filter((ticket) => {
    if (filters.status && ticket.status !== filters.status) return false
    if (filters.priority && ticket.priority !== filters.priority) return false
    if (filters.team && ticket.assignedTeam !== filters.team) return false
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase()
      return (
        ticket.title.toLowerCase().includes(searchLower) ||
        ticket.description.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  const renderTicketItem = (ticket: TicketResponse) => (
    <div key={ticket.id} className="ticket-item" onClick={() => onTicketClick?.(ticket)}>
      <div className="ticket-header">
        <div className="ticket-meta">
          <span className={`status-badge status-${getStatusColor(ticket.status)}`}>
            {getStatusLabel(ticket.status)}
          </span>
          <span className={`priority-badge priority-${getPriorityColor(ticket.priority)}`}>
            {getPriorityLabel(ticket.priority)}
          </span>
        </div>
        <div className="ticket-date">{formatDate(ticket.createdAt)}</div>
      </div>

      <div className="ticket-content">
        <h3 className="ticket-title">{ticket.title}</h3>

        {ticket.description && <p className="ticket-description">{ticket.description}</p>}
      </div>

      <div className="ticket-footer">
        <div className="ticket-assignment">
          {ticket.assignedTeam && (
            <span className="assigned-team">Team: {getTeamLabel(ticket.assignedTeam)}</span>
          )}
          {ticket.assignedUserId && (
            <span className="assigned-user">Assigned to: {ticket.assignedUserId}</span>
          )}
        </div>

        <div className="ticket-actions">
          <button className="btn btn-sm btn-primary">View</button>
          {(isTechnician || isAdmin) && <button className="btn btn-sm btn-secondary">Edit</button>}
        </div>
      </div>
    </div>
  )

  const renderFilters = () => {
    if (!showFilters) return null

    return (
      <div className="ticket-filters">
        <div className="filter-row">
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Status</option>
            {Object.values(TicketStatus).map((status) => (
              <option key={status} value={status}>
                {getStatusLabel(status)}
              </option>
            ))}
          </select>

          <select
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
          >
            <option value="">All Priorities</option>
            {Object.values(Priority).map((priority) => (
              <option key={priority} value={priority}>
                {getPriorityLabel(priority)}
              </option>
            ))}
          </select>

          <select value={filters.team} onChange={(e) => handleFilterChange('team', e.target.value)}>
            <option value="">All Teams</option>
            {Object.values(Team).map((team) => (
              <option key={team} value={team}>
                {getTeamLabel(team)}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-row">
          <input
            type="text"
            placeholder="Search tickets..."
            value={filters.searchTerm}
            onChange={(e) => handleFilterChange('searchTerm', e.target.value)}
          />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return <div className="loading">Loading tickets...</div>
  }

  if (tickets.length === 0) {
    return (
      <div className="ticket-list">
        <h2>{title}</h2>
        {renderFilters()}
        <div className="no-tickets">No tickets found.</div>
      </div>
    )
  }

  const handlePageChange = (newPage: number) => {
    if (onPageChange) {
      onPageChange(newPage)
    } else {
      setFilters((prev) => ({ ...prev, page: newPage }))
    }
  }

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(event.target.value)
    if (onPageSizeChange) {
      onPageSizeChange(newSize)
    } else {
      setFilters((prev) => ({ ...prev, size: newSize, page: 0 }))
    }
  }

  return (
    <div className="ticket-list">
      <div className="list-header">
        <h2>{title}</h2>
        <div className="list-actions">
          <button className="btn btn-primary">Create Ticket</button>
        </div>
      </div>

      {renderFilters()}

      <div className="tickets-container">{filteredTickets.map(renderTicketItem)}</div>

      {showPagination && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(Math.max(0, (currentPage ?? filters.page) - 1))}
            disabled={(currentPage ?? filters.page) === 0}
            className="btn btn-secondary"
          >
            Previous
          </button>

          <span className="page-info">
            Page {(currentPage ?? filters.page) + 1}
            {totalPages && ` of ${totalPages}`}
            {totalItems && ` (${totalItems} items)`}
          </span>

          <select
            value={pageSize ?? filters.size}
            onChange={handlePageSizeChange}
            className="page-size-select"
          >
            <option value="10">10 per page</option>
            <option value="20">20 per page</option>
            <option value="50">50 per page</option>
          </select>

          <button
            onClick={() => handlePageChange((currentPage ?? filters.page) + 1)}
            disabled={
              totalPages
                ? (currentPage ?? filters.page) >= totalPages - 1
                : filteredTickets.length < (pageSize ?? filters.size)
            }
            className="btn btn-secondary"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
