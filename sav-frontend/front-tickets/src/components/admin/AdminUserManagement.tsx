import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { usersApi } from '@/api'
import { UserRole, UserStatus } from '@/constants/roles'
import { getErrorMessage } from '@/utils/errorUtils'
import type { UserResponse, UpdateUserRoleRequest, UpdateUserStatusRequest } from '@/types'

export default function AdminUserManagement() {
  const queryClient = useQueryClient()
  const [, setSelectedUser] = useState<UserResponse | null>(null)
  const [actionError, setActionError] = useState<string>('')

  const {
    data: users,
    isLoading,
    error,
  } = useQuery<UserResponse[]>({
    queryKey: ['admin', 'users'],
    queryFn: () => usersApi.getAll(),
  })

  const updateRoleMutation = useMutation({
    mutationFn: ({ userId, request }: { userId: string; request: UpdateUserRoleRequest }) =>
      usersApi.updateRole(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setActionError('')
      setSelectedUser(null)
    },
    onError: (error) => {
      setActionError(getErrorMessage(error))
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ userId, request }: { userId: string; request: UpdateUserStatusRequest }) =>
      usersApi.updateStatus(userId, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setActionError('')
      setSelectedUser(null)
    },
    onError: (error) => {
      setActionError(getErrorMessage(error))
    },
  })

  const activateMutation = useMutation({
    mutationFn: (userId: string) => usersApi.activate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setActionError('')
    },
    onError: (error) => {
      setActionError(getErrorMessage(error))
    },
  })

  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => usersApi.deactivate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      setActionError('')
    },
    onError: (error) => {
      setActionError(getErrorMessage(error))
    },
  })

  const handleRoleChange = (user: UserResponse, newRole: UserRole) => {
    updateRoleMutation.mutate({
      userId: user.id,
      request: { role: newRole },
    })
  }

  const handleStatusChange = (user: UserResponse, newStatus: UserStatus) => {
    updateStatusMutation.mutate({
      userId: user.id,
      request: { status: newStatus },
    })
  }

  if (isLoading) {
    return (
      <div className="admin-user-management">
        <h1>User Management</h1>
        <div>Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="admin-user-management">
        <h1>User Management</h1>
        <div className="error-message" style={{ color: 'red', padding: '10px' }}>
          Error loading users: {getErrorMessage(error)}
        </div>
      </div>
    )
  }

  return (
    <div className="admin-user-management">
      <h1>User Management</h1>

      {actionError && (
        <div
          className="error-banner"
          style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '10px',
            marginBottom: '20px',
            borderRadius: '4px',
            border: '1px solid #fcc',
          }}
        >
          {actionError}
        </div>
      )}

      <div className="users-table" style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            border: '1px solid #ddd',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#f5f5f5' }}>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Name</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>
                Email
              </th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>Role</th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>
                Status
              </th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>
                Company
              </th>
              <th style={{ padding: '12px', border: '1px solid #ddd', textAlign: 'left' }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {users?.map((user) => (
              <tr key={user.id}>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {user.fullName || `${user.firstName} ${user.lastName}`}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>{user.email}</td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user, e.target.value as UserRole)}
                    style={{ padding: '4px', borderRadius: '4px' }}
                  >
                    <option value={UserRole.USER}>User</option>
                    <option value={UserRole.TECHNICIAN}>Technician</option>
                    <option value={UserRole.ADMIN}>Admin</option>
                  </select>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <select
                    value={user.status}
                    onChange={(e) => handleStatusChange(user, e.target.value as UserStatus)}
                    style={{ padding: '4px', borderRadius: '4px' }}
                  >
                    <option value={UserStatus.ACTIVE}>Active</option>
                    <option value={UserStatus.INACTIVE}>Inactive</option>
                    <option value={UserStatus.SUSPENDED}>Suspended</option>
                    <option value={UserStatus.PENDING_ACTIVATION}>Pending</option>
                  </select>
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  {user.company || 'N/A'}
                </td>
                <td style={{ padding: '12px', border: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {user.status !== UserStatus.ACTIVE && (
                      <button
                        onClick={() => activateMutation.mutate(user.id)}
                        disabled={activateMutation.isPending}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: '#28a745',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Activate
                      </button>
                    )}
                    {user.status === UserStatus.ACTIVE && (
                      <button
                        onClick={() => deactivateMutation.mutate(user.id)}
                        disabled={deactivateMutation.isPending}
                        style={{
                          padding: '4px 8px',
                          fontSize: '12px',
                          backgroundColor: '#dc3545',
                          color: 'white',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users && users.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No users found.</div>
      )}
    </div>
  )
}
