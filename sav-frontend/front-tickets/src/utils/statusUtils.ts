import { TicketStatus, Priority, Team } from '@/types'

export const getStatusColor = (status: TicketStatus): string => {
  switch (status) {
    case TicketStatus.OPEN:
      return 'blue'
    case TicketStatus.ASSIGNED:
      return 'orange'
    case TicketStatus.IN_PROGRESS:
      return 'yellow'
    case TicketStatus.RESOLVED:
      return 'green'
    case TicketStatus.REOPENED:
      return 'red'
    case TicketStatus.CLOSED:
      return 'gray'
    default:
      return 'gray'
  }
}

export const getPriorityColor = (priority: Priority): string => {
  switch (priority) {
    case Priority.LOW:
      return 'green'
    case Priority.MEDIUM:
      return 'blue'
    case Priority.HIGH:
      return 'orange'
    case Priority.CRITICAL:
      return 'red'
    default:
      return 'gray'
  }
}

export const getStatusLabel = (status: TicketStatus): string => {
  switch (status) {
    case TicketStatus.OPEN:
      return 'Open'
    case TicketStatus.ASSIGNED:
      return 'Assigned'
    case TicketStatus.IN_PROGRESS:
      return 'In Progress'
    case TicketStatus.RESOLVED:
      return 'Resolved'
    case TicketStatus.REOPENED:
      return 'Reopened'
    case TicketStatus.CLOSED:
      return 'Closed'
    default:
      return status
  }
}

export const getPriorityLabel = (priority: Priority): string => {
  switch (priority) {
    case Priority.LOW:
      return 'Low'
    case Priority.MEDIUM:
      return 'Medium'
    case Priority.HIGH:
      return 'High'
    case Priority.CRITICAL:
      return 'Critical'
    default:
      return priority
  }
}

export const getTeamLabel = (team: Team): string => {
  switch (team) {
    case Team.SUPPORT:
      return 'Support'
    case Team.DEVELOPMENT:
      return 'Development'
    default:
      return team
  }
}
