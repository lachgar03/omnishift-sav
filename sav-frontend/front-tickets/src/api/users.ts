import { axiosInstance } from './axiosInstance'
import { API_ENDPOINTS } from '@/constants/api'
import type { 
  UserResponse, 
  CreateUserRequest, 
  UpdateUserProfileRequest
} from '@/types'

export const usersApi = {
  // Current user
  getCurrentUser: async (): Promise<UserResponse> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS_ME)
    return data
  },
  
  updateCurrentUser: async (userData: UpdateUserProfileRequest): Promise<UserResponse> => {
    const { data } = await axiosInstance.put(API_ENDPOINTS.USERS_ME, userData)
    return data
  },
  
  // User administration
  getAll: async (): Promise<UserResponse[]> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS)
    return data
  },
  
  getById: async (id: string): Promise<UserResponse> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.USERS}/${id}`)
    return data
  },
  
  getTechnicians: async (): Promise<UserResponse[]> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS_TECHNICIANS)
    return data
  },
  
  getByRole: async (role: string): Promise<UserResponse[]> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.USERS_BY_ROLE}/${role}`)
    return data
  },
  
  getByStatus: async (status: string): Promise<UserResponse[]> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.USERS_BY_STATUS}/${status}`)
    return data
  },
  
  search: async (username: string): Promise<UserResponse[]> => {
    const { data } = await axiosInstance.get(`${API_ENDPOINTS.USERS_SEARCH}?username=${username}`)
    return data
  },
  
  getStatistics: async (): Promise<any> => {
    const { data } = await axiosInstance.get(API_ENDPOINTS.USERS_STATISTICS)
    return data
  },
  
  // User management (Admin only)
  create: async (user: CreateUserRequest): Promise<UserResponse> => {
    const { data } = await axiosInstance.post(API_ENDPOINTS.USERS, user)
    return data
  },
  
  updateRole: async (userId: string, role: string): Promise<UserResponse> => {
    const { data } = await axiosInstance.put(`${API_ENDPOINTS.USERS}/${userId}/role`, { role })
    return data
  },
  
  updateStatus: async (userId: string, status: string): Promise<UserResponse> => {
    const { data } = await axiosInstance.put(`${API_ENDPOINTS.USERS}/${userId}/status`, { status })
    return data
  },
  
  activate: async (userId: string): Promise<UserResponse> => {
    const { data } = await axiosInstance.patch(`${API_ENDPOINTS.USERS}/${userId}/activate`, {})
    return data
  },
  
  deactivate: async (userId: string): Promise<UserResponse> => {
    const { data } = await axiosInstance.patch(`${API_ENDPOINTS.USERS}/${userId}/deactivate`, {})
    return data
  }
}
