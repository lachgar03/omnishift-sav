import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import type { UserResponse } from '@/types'

export default function UserList() {
  const {
    data: users,
    isLoading,
    error,
  } = useQuery<UserResponse[]>({
    queryKey: ['users'],
    queryFn: () => usersApi.getAll(),
  })

  if (isLoading) {
    return (
      <div className="user-list">
        <h1>Users</h1>
        <div>Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="user-list">
        <h1>Users</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error loading users: {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  return (
    <div className="user-list">
      <h1>Users</h1>

      <div
        className="users-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        {users?.map((user: UserResponse) => (
          <div
            key={user.id}
            className="user-card"
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#f9f9f9',
            }}
          >
            <div className="user-header" style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 5px 0' }}>
                {user.fullName || `${user.firstName} ${user.lastName}`}
              </h3>
              <div style={{ fontSize: '14px', color: '#666' }}>@{user.username}</div>
            </div>

            <div className="user-details">
              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <strong>Email:</strong> {user.email}
              </div>

              {user.phoneNumber && (
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <strong>Phone:</strong> {user.phoneNumber}
                </div>
              )}

              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <strong>Role:</strong>
                <span
                  style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor:
                      user.role === 'ADMIN'
                        ? '#dc3545'
                        : user.role === 'TECHNICIAN'
                          ? '#007bff'
                          : '#28a745',
                    color: 'white',
                  }}
                >
                  {user.role}
                </span>
              </div>

              <div className="detail-item" style={{ marginBottom: '8px' }}>
                <strong>Status:</strong>
                <span
                  style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor:
                      user.status === 'ACTIVE'
                        ? '#28a745'
                        : user.status === 'SUSPENDED'
                          ? '#dc3545'
                          : '#ffc107',
                    color: user.status === 'PENDING_ACTIVATION' ? '#000' : 'white',
                  }}
                >
                  {user.status}
                </span>
              </div>

              {user.company && (
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <strong>Company:</strong> {user.company}
                </div>
              )}

              {user.department && (
                <div className="detail-item" style={{ marginBottom: '8px' }}>
                  <strong>Department:</strong> {user.department}
                </div>
              )}

              <div
                className="detail-item"
                style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}
              >
                <strong>Created:</strong> {formatDate(user.createdAt)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {users && users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No users found.</div>
      )}
    </div>
  )
}
