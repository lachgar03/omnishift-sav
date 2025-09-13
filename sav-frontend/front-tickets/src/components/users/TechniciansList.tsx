import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { usersApi } from '@/api'
import { getErrorMessage } from '@/utils/errorUtils'
import { formatDate } from '@/utils/formatDate'
import type { UserResponse } from '@/types'

export default function TechniciansList() {
  const navigate = useNavigate()
  const {
    data: technicians,
    isLoading,
    error,
  } = useQuery<UserResponse[]>({
    queryKey: ['technicians'],
    queryFn: () => usersApi.getTechnicians(),
  })

  if (isLoading) {
    return (
      <div className="technicians-list">
        <h1>Available Technicians</h1>
        <div>Loading technicians...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="technicians-list">
        <h1>Available Technicians</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error loading technicians: {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  return (
    <div className="technicians-list">
      <h1>Available Technicians</h1>

      <div
        className="technicians-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
          gap: '20px',
          marginTop: '20px',
        }}
      >
        {technicians?.map((technician: UserResponse) => (
          <div
            key={technician.id}
            className="technician-card"
            style={{
              border: '1px solid #ddd',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
            }}
          >
            <div className="technician-header" style={{ marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 5px 0', color: '#007bff' }}>
                {technician.fullName || `${technician.firstName} ${technician.lastName}`}
              </h3>
              <div style={{ fontSize: '14px', color: '#666' }}>@{technician.username}</div>
            </div>

            <div className="technician-details">
              <div className="detail-item" style={{ marginBottom: '10px' }}>
                <strong>Email:</strong>
                <a
                  href={`mailto:${technician.email}`}
                  style={{ marginLeft: '8px', color: '#007bff', textDecoration: 'none' }}
                >
                  {technician.email}
                </a>
              </div>

              {technician.phoneNumber && (
                <div className="detail-item" style={{ marginBottom: '10px' }}>
                  <strong>Phone:</strong>
                  <a
                    href={`tel:${technician.phoneNumber}`}
                    style={{ marginLeft: '8px', color: '#007bff', textDecoration: 'none' }}
                  >
                    {technician.phoneNumber}
                  </a>
                </div>
              )}

              <div className="detail-item" style={{ marginBottom: '10px' }}>
                <strong>Status:</strong>
                <span
                  style={{
                    marginLeft: '8px',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '12px',
                    backgroundColor: technician.status === 'ACTIVE' ? '#28a745' : '#ffc107',
                    color: technician.status === 'ACTIVE' ? 'white' : '#000',
                  }}
                >
                  {technician.status}
                </span>
              </div>

              {technician.company && (
                <div className="detail-item" style={{ marginBottom: '10px' }}>
                  <strong>Company:</strong> {technician.company}
                </div>
              )}

              {technician.department && (
                <div className="detail-item" style={{ marginBottom: '10px' }}>
                  <strong>Department:</strong> {technician.department}
                </div>
              )}

              <div
                className="detail-item"
                style={{ fontSize: '12px', color: '#666', marginTop: '15px' }}
              >
                <strong>Member since:</strong> {formatDate(technician.createdAt)}
              </div>
            </div>

            <div
              className="technician-actions"
              style={{ marginTop: '15px', paddingTop: '15px', borderTop: '1px solid #dee2e6' }}
            >
              <button
                style={{
                  width: '100%',
                  padding: '8px 15px',
                  backgroundColor: '#007bff',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                }}
                onClick={() => navigate({ to: `/users/${technician.id}` })}
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>

      {technicians && technicians.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>No technicians available</h3>
          <p>There are currently no technicians in the system.</p>
        </div>
      )}

      <div
        className="technicians-summary"
        style={{
          marginTop: '30px',
          padding: '20px',
          backgroundColor: '#e7f3ff',
          borderRadius: '8px',
          border: '1px solid #bee5eb',
        }}
      >
        <h4 style={{ margin: '0 0 10px 0' }}>Summary</h4>
        <p style={{ margin: 0 }}>
          <strong>{technicians?.length || 0}</strong> technician
          {technicians?.length !== 1 ? 's' : ''} available for ticket assignment.
        </p>
      </div>
    </div>
  )
}
