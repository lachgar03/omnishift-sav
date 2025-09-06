import { useQuery } from '@tanstack/react-query'
import { ticketsApi, usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { Priority, UserStatus } from '@/constants/roles'
import type { TicketStatsResponse, UserStatsResponse, UserResponse, TicketResponse } from '@/types'

export default function SystemStatistics() {
  const {
    data: ticketStats,
    isLoading: isLoadingTickets,
    error: ticketError,
  } = useQuery<TicketStatsResponse>({
    queryKey: ['admin', 'ticket-stats'],
    queryFn: () => ticketsApi.getStatistics(),
  })

  const {
    data: userStats,
    isLoading: isLoadingUsers,
    error: userError,
  } = useQuery<UserStatsResponse>({
    queryKey: ['admin', 'user-stats'],
    queryFn: () => usersApi.getStatistics(),
  })

  // Additional queries for detailed breakdown
  const { data: highPriorityTickets } = useQuery<TicketResponse[]>({
    queryKey: ['admin', 'high-priority-tickets'],
    queryFn: () => ticketsApi.getByPriority(Priority.HIGH),
  })

  const { data: criticalTickets } = useQuery<TicketResponse[]>({
    queryKey: ['admin', 'critical-tickets'],
    queryFn: () => ticketsApi.getByPriority(Priority.CRITICAL),
  })

  const { data: pendingUsers } = useQuery<UserResponse[]>({
    queryKey: ['admin', 'pending-users'],
    queryFn: () => usersApi.getByStatus(UserStatus.PENDING_ACTIVATION),
  })

  if (isLoadingTickets || isLoadingUsers) {
    return (
      <div className="system-statistics">
        <h1>System Statistics</h1>
        <div>Loading statistics...</div>
      </div>
    )
  }

  if (ticketError || userError) {
    return (
      <div className="system-statistics">
        <h1>System Statistics</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error loading statistics: {getErrorMessage(ticketError || userError)}
        </div>
      </div>
    )
  }

  const calculateTicketResolutionRate = () => {
    if (!ticketStats) return 0
    const total = ticketStats.totalTickets
    if (total === 0) return 0
    return Math.round((ticketStats.closedTickets / total) * 100)
  }

  const calculateUserActivityRate = () => {
    if (!userStats) return 0
    const total = userStats.totalUsers
    if (total === 0) return 0
    return Math.round((userStats.activeUsers / total) * 100)
  }

  return (
    <div className="system-statistics">
      <h1>System Statistics</h1>

      <div
        className="statistics-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        {/* Ticket Overview */}
        <div
          className="stats-card"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
          }}
        >
          <h3>Ticket Overview</h3>
          {ticketStats && (
            <div
              className="stats-grid"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
            >
              <div className="stat-item">
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                  {ticketStats.totalTickets}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Total Tickets</div>
              </div>
              <div className="stat-item">
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  {ticketStats.closedTickets}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Resolved</div>
              </div>
              <div className="stat-item">
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#ffc107' }}>
                  {ticketStats.inProgressTickets}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>In Progress</div>
              </div>
              <div className="stat-item">
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc3545' }}>
                  {ticketStats.openTickets}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Open</div>
              </div>
            </div>
          )}
          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#e7f3ff',
              borderRadius: '4px',
            }}
          >
            <strong>Resolution Rate: {calculateTicketResolutionRate()}%</strong>
          </div>
        </div>

        {/* User Overview */}
        <div
          className="stats-card"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
          }}
        >
          <h3>User Overview</h3>
          {userStats && (
            <div
              className="stats-grid"
              style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}
            >
              <div className="stat-item">
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#007bff' }}>
                  {userStats.totalUsers}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Total Users</div>
              </div>
              <div className="stat-item">
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#28a745' }}>
                  {userStats.activeUsers}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Active</div>
              </div>
              <div className="stat-item">
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#17a2b8' }}>
                  {userStats.technicians}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Technicians</div>
              </div>
              <div className="stat-item">
                <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#6c757d' }}>
                  {userStats.admins}
                </div>
                <div style={{ fontSize: '14px', color: '#666' }}>Admins</div>
              </div>
            </div>
          )}
          <div
            style={{
              marginTop: '15px',
              padding: '10px',
              backgroundColor: '#e7f3ff',
              borderRadius: '4px',
            }}
          >
            <strong>Activity Rate: {calculateUserActivityRate()}%</strong>
          </div>
        </div>

        {/* Priority Breakdown */}
        <div
          className="stats-card"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
          }}
        >
          <h3>High Priority Tickets</h3>
          <div className="priority-stats">
            <div className="stat-item" style={{ marginBottom: '15px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ color: '#dc3545', fontWeight: 'bold' }}>Critical Priority</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {criticalTickets?.length || 0}
                </span>
              </div>
            </div>
            <div className="stat-item" style={{ marginBottom: '15px' }}>
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ color: '#fd7e14', fontWeight: 'bold' }}>High Priority</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {highPriorityTickets?.length || 0}
                </span>
              </div>
            </div>
            <div className="stat-item">
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <span style={{ color: '#ffc107', fontWeight: 'bold' }}>Assigned Tickets</span>
                <span style={{ fontSize: '18px', fontWeight: 'bold' }}>
                  {ticketStats?.assignedTickets || 0}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* System Health */}
        <div
          className="stats-card"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f8f9fa',
          }}
        >
          <h3>System Health</h3>
          <div className="health-indicators">
            <div
              className="health-item"
              style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}
            >
              <span style={{ color: '#28a745', fontSize: '20px', marginRight: '10px' }}>●</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>Backend Service</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Operational</div>
              </div>
            </div>
            <div
              className="health-item"
              style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}
            >
              <span style={{ color: '#28a745', fontSize: '20px', marginRight: '10px' }}>●</span>
              <div>
                <div style={{ fontWeight: 'bold' }}>Authentication</div>
                <div style={{ fontSize: '14px', color: '#666' }}>Active</div>
              </div>
            </div>
            <div
              className="health-item"
              style={{ marginBottom: '15px', display: 'flex', alignItems: 'center' }}
            >
              <span
                style={{
                  color: pendingUsers && pendingUsers.length > 0 ? '#ffc107' : '#28a745',
                  fontSize: '20px',
                  marginRight: '10px',
                }}
              >
                ●
              </span>
              <div>
                <div style={{ fontWeight: 'bold' }}>Pending Users</div>
                <div style={{ fontSize: '14px', color: '#666' }}>
                  {pendingUsers?.length || 0} awaiting activation
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
