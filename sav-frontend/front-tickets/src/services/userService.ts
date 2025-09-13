import { apiClient } from './apiClient'
import type {
  User,
  CreateUserRequest,
  UpdateUserProfileRequest,
  PaginatedResponse,
  UserStatistics,
} from '../types/api'

export class UserService {
  async getCurrentUser(): Promise<User> {
    return apiClient.get<User>('/users/me')
  }

  async updateCurrentUser(request: UpdateUserProfileRequest): Promise<User> {
    return apiClient.put<User>('/users/me', request)
  }

  async getUsers(page: number = 0, size: number = 20): Promise<PaginatedResponse<User>> {
    return apiClient.get<PaginatedResponse<User>>(`/users?page=${page}&size=${size}`)
  }

  async getUser(id: string): Promise<User> {
    return apiClient.get<User>(`/users/${id}`)
  }

  async createUser(request: CreateUserRequest): Promise<User> {
    return apiClient.post<User>('/users', request)
  }

  async getTechnicians(): Promise<User[]> {
    return apiClient.get<User[]>('/users/technicians')
  }

  async getUsersByRole(role: string): Promise<User[]> {
    return apiClient.get<User[]>(`/users/role/${role}`)
  }

  async updateUserRole(id: string, role: string): Promise<User> {
    return apiClient.put<User>(`/users/${id}/role`, { role })
  }

  async updateUserStatus(id: string, status: string): Promise<User> {
    return apiClient.put<User>(`/users/${id}/status`, { status })
  }

  async activateUser(id: string): Promise<User> {
    return apiClient.patch<User>(`/users/${id}/activate`)
  }

  async deactivateUser(id: string): Promise<User> {
    return apiClient.patch<User>(`/users/${id}/deactivate`)
  }

  async getUserStatistics(): Promise<UserStatistics> {
    return apiClient.get('/users/statistics')
  }
}

export const userService = new UserService()
