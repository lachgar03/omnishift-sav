import { useState, useEffect, useCallback } from 'react'
import { userService } from '../services/userService'
import type { User, CreateUserRequest, UpdateUserProfileRequest } from '../types/api'

export const useUsers = (page: number = 0, size: number = 20) => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [totalElements, setTotalElements] = useState(0)

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await userService.getUsers(page, size)
      setUsers(response.content)
      setTotalPages(response.totalPages)
      setTotalElements(response.totalElements)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users')
    } finally {
      setLoading(false)
    }
  }, [page, size])

  const createUser = useCallback(async (request: CreateUserRequest) => {
    try {
      setLoading(true)
      setError(null)
      const newUser = await userService.createUser(request)
      setUsers((prev) => [newUser, ...prev])
      return newUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create user')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateUser = useCallback(async (id: string, request: UpdateUserProfileRequest) => {
    try {
      setLoading(true)
      setError(null)
      const updatedUser = await userService.updateCurrentUser(request)
      setUsers((prev) => prev.map((user) => (user.id === id ? updatedUser : user)))
      return updatedUser
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return {
    users,
    loading,
    error,
    totalPages,
    totalElements,
    fetchUsers,
    createUser,
    updateUser,
  }
}
