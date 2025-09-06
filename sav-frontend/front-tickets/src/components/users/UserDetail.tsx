import { useQuery } from '@tanstack/react-query'
import { useParams } from '@tanstack/react-router'
import { usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import type { UserResponse } from '@/types'

export default function UserDetail() {
  const { id } = useParams({ strict: false }) as { id: string }

  const {
    data: user,
    isLoading,
    error,
  } = useQuery<UserResponse>({
    queryKey: ['users', id],
    queryFn: () => usersApi.getById(id),
    enabled: !!id,
  })

  if (!id) {
    return (
      <div className="user-detail">
        <h1>User Detail</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          No user ID provided.
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="user-detail">
        <h1>User Detail</h1>
        <div>Loading user...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="user-detail">
        <h1>User Detail</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error loading user: {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="user-detail">
        <h1>User Detail</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          User not found.
        </div>
      </div>
    )
  }

  return (
    <div className="user-detail">
      <div className="header" style={{ marginBottom: '30px' }}>
        <h1>{user.fullName || `${user.firstName} ${user.lastName}`}</h1>
        <div style={{ fontSize: '16px', color: '#666' }}>@{user.username}</div>
      </div>

      <div
        className="user-info-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px',
        }}
      >
        {/* Basic Information */}
        <div
          className="info-card"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Basic Information</h3>

          <div className="info-grid" style={{ display: 'grid', gap: '15px' }}>
            <div className="info-item">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Email</div>
              <div>{user.email}</div>
            </div>

            {user.phoneNumber && (
              <div className="info-item">
                <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Phone Number</div>
                <div>{user.phoneNumber}</div>
              </div>
            )}

            <div className="info-item">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Role</div>
              <div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
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
            </div>

            <div className="info-item">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Status</div>
              <div>
                <span
                  style={{
                    padding: '4px 12px',
                    borderRadius: '16px',
                    fontSize: '14px',
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
            </div>
          </div>
        </div>

        {/* Organization Information */}
        <div
          className="info-card"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Organization</h3>

          <div className="info-grid" style={{ display: 'grid', gap: '15px' }}>
            <div className="info-item">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Company</div>
              <div>{user.company || 'Not specified'}</div>
            </div>

            <div className="info-item">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Department</div>
              <div>{user.department || 'Not specified'}</div>
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div
          className="info-card"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Account Information</h3>

          <div className="info-grid" style={{ display: 'grid', gap: '15px' }}>
            <div className="info-item">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>User ID</div>
              <div style={{ fontFamily: 'monospace', fontSize: '14px' }}>{user.id}</div>
            </div>

            <div className="info-item">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Created</div>
              <div>{formatDate(user.createdAt)}</div>
            </div>

            <div className="info-item">
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>Last Updated</div>
              <div>{formatDate(user.updatedAt)}</div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div
          className="info-card"
          style={{
            border: '1px solid #ddd',
            borderRadius: '8px',
            padding: '20px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h3 style={{ marginTop: 0 }}>Actions</h3>

          <div className="actions-grid" style={{ display: 'grid', gap: '10px' }}>
            <button
              style={{
                padding: '10px 15px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => (window.location.href = `/users/${user.id}/edit`)}
            >
              Edit User
            </button>

            <button
              style={{
                padding: '10px 15px',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
              onClick={() => window.history.back()}
            >
              Back to Users
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
