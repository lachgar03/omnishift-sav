import { useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@store/authStore'
import { ticketsApi, usersApi } from '@/api'
import type { DashboardResponse, TicketStatsResponse } from '@/types'
import { getStatusColor, getPriorityColor } from '@/utils/statusUtils'

// Define the UserStatsResponse interface locally
interface UserStatsResponse {
  totalUsers: number;
  activeUsers: number;
  technicians: number;
  admins: number;
}

export default function DashboardPage() {
  const authStore = useAuthStore()

  // Fetch dashboard data
  const { data: dashboardData, isLoading: dashboardLoading } = useQuery<DashboardResponse>({
    queryKey: ['dashboard'],
    queryFn: ticketsApi.getDashboard,
  })

  // Fetch global statistics (Admin/Technician only)
  const { data: ticketStats } = useQuery<TicketStatsResponse>({
    queryKey: ['ticket-stats'],
    queryFn: ticketsApi.getStatistics,
    enabled: authStore.isTechnician || authStore.isAdmin,
  })

  // Fetch user statistics (Admin only)
  const { data: userStats } = useQuery<UserStatsResponse>({
    queryKey: ['user-stats'],
    queryFn: usersApi.getStatistics,
    enabled: authStore.isAdmin,
  })

  if (dashboardLoading) {
    return <div>Loading dashboard...</div>
  }

  const renderUserDashboard = () => (
    <div className="dashboard-section">
      <h2>My Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>My Tickets</h3>
          <p className="stat-number">{dashboardData?.myTicketsCount || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Open Tickets</h3>
          <p className="stat-number">{dashboardData?.myOpenTickets || 0}</p>
        </div>
        <div className="stat-card">
          <h3>In Progress</h3>
          <p className="stat-number">{dashboardData?.myInProgressTickets || 0}</p>
        </div>
      </div>
      
      {dashboardData?.recentTickets && dashboardData.recentTickets.length > 0 && (
        <div className="recent-tickets">
          <h3>Recent Tickets</h3>
          <div className="tickets-list">
            {dashboardData.recentTickets.map(ticket => (
              <div key={ticket.id} className="ticket-item">
                <span className={`status-badge status-${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`priority-badge priority-${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className="ticket-title">{ticket.title}</span>
                <span className="ticket-date">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderTechnicianDashboard = () => (
    <div className="dashboard-section">
      <h2>Technician Dashboard</h2>
      <div className="stats-grid">
        <div className="stat-card">
          <h3>Assigned to Me</h3>
          <p className="stat-number">{dashboardData?.assignedToMeCount || 0}</p>
        </div>
        <div className="stat-card">
          <h3>My Tickets</h3>
          <p className="stat-number">{dashboardData?.myTicketsCount || 0}</p>
        </div>
        <div className="stat-card">
          <h3>Open Tickets</h3>
          <p className="stat-number">{dashboardData?.myOpenTickets || 0}</p>
        </div>
      </div>

      {ticketStats && (
        <div className="global-stats">
          <h3>System Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Tickets</h4>
              <p className="stat-number">{ticketStats.totalTickets}</p>
            </div>
            <div className="stat-card">
              <h4>Active Tickets</h4>
              <p className="stat-number">{ticketStats.activeTickets}</p>
            </div>
            <div className="stat-card">
              <h4>Completion Rate</h4>
              <p className="stat-number">{ticketStats.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {dashboardData?.urgentTickets && dashboardData.urgentTickets.length > 0 && (
        <div className="urgent-tickets">
          <h3>Urgent Tickets</h3>
          <div className="tickets-list">
            {dashboardData.urgentTickets.map(ticket => (
              <div key={ticket.id} className="ticket-item urgent">
                <span className={`status-badge status-${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`priority-badge priority-${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className="ticket-title">{ticket.title}</span>
                <span className="ticket-date">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderAdminDashboard = () => (
    <div className="dashboard-section">
      <h2>Admin Dashboard</h2>
      
      {userStats && (
        <div className="user-stats">
          <h3>User Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Users</h4>
              <p className="stat-number">{userStats.totalUsers}</p>
            </div>
            <div className="stat-card">
              <h4>Active Users</h4>
              <p className="stat-number">{userStats.activeUsers}</p>
            </div>
            <div className="stat-card">
              <h4>Technicians</h4>
              <p className="stat-number">{userStats.technicians}</p>
            </div>
            <div className="stat-card">
              <h4>Admins</h4>
              <p className="stat-number">{userStats.admins}</p>
            </div>
          </div>
        </div>
      )}

      {ticketStats && (
        <div className="ticket-stats">
          <h3>Ticket Statistics</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <h4>Total Tickets</h4>
              <p className="stat-number">{ticketStats.totalTickets}</p>
            </div>
            <div className="stat-card">
              <h4>Open Tickets</h4>
              <p className="stat-number">{ticketStats.openTickets}</p>
            </div>
            <div className="stat-card">
              <h4>In Progress</h4>
              <p className="stat-number">{ticketStats.inProgressTickets}</p>
            </div>
            <div className="stat-card">
              <h4>Resolved</h4>
              <p className="stat-number">{ticketStats.resolvedTickets}</p>
            </div>
            <div className="stat-card">
              <h4>Completion Rate</h4>
              <p className="stat-number">{ticketStats.completionRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      )}

      {dashboardData?.unassignedTickets && dashboardData.unassignedTickets.length > 0 && (
        <div className="unassigned-tickets">
          <h3>Unassigned Tickets</h3>
          <div className="tickets-list">
            {dashboardData.unassignedTickets.map(ticket => (
              <div key={ticket.id} className="ticket-item unassigned">
                <span className={`status-badge status-${getStatusColor(ticket.status)}`}>
                  {ticket.status}
                </span>
                <span className={`priority-badge priority-${getPriorityColor(ticket.priority)}`}>
                  {ticket.priority}
                </span>
                <span className="ticket-title">{ticket.title}</span>
                <span className="ticket-date">
                  {new Date(ticket.createdAt).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  const renderDashboard = () => {
    if (authStore.isAdmin) {
      return renderAdminDashboard()
    } else if (authStore.isTechnician) {
      return renderTechnicianDashboard()
    } else {
      return renderUserDashboard()
    }
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <h1>Welcome to SAV System</h1>
        <p>Support ticket management dashboard</p>
      </div>
      
      {renderDashboard()}
    </div>
  )
}
