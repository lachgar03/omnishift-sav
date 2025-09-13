// Re-export modules
export * from './authConfig'
export * from './axiosInstance'
export * from './queryClient'
export * from './tickets'
export * from './users'

// Re-export user sync utilities
export * from '../utils/userSyncUtils'

// Re-export specific functions for convenience
export { initAuth, login, logout, getToken, refreshToken } from './authConfig'

// Re-export API modules for direct access
export { ticketsApi, ticketMessagesApi, ticketAttachmentsApi } from './tickets'
export { usersApi } from './users'

// Add wrapper functions for components that expect them
import { ticketsApi, ticketMessagesApi, ticketAttachmentsApi } from './tickets'
import { usersApi } from './users'
import type {
  TicketResponse,
  PageResponse,
  TicketFilterRequest,
  TicketMessageResponse,
  TicketAttachmentResponse,
  CreateTicketMessageRequest,
  CreateTicketRequest,
  UpdateTicketRequest,
  UserResponse,
  CreateUserRequest,
  UpdateUserProfileRequest,
  DashboardResponse,
  UserStatsResponse,
  UserRole as UserRoleType,
  UserStatus as UserStatusType,
} from '@/types'

// Ticket wrapper functions
export const getMyTickets = async (): Promise<TicketResponse[]> => {
  return await ticketsApi.getMyTickets()
}

export const getTickets = async (
  params: TicketFilterRequest,
): Promise<PageResponse<TicketResponse>> => {
  return await ticketsApi.getAll(params)
}

export const getTicket = async (id: string | number): Promise<TicketResponse> => {
  return await ticketsApi.getById(id)
}

export const createTicket = async (data: CreateTicketRequest): Promise<TicketResponse> => {
  return await ticketsApi.create(data)
}

export const updateTicket = async (
  id: string | number,
  data: UpdateTicketRequest,
): Promise<TicketResponse> => {
  return await ticketsApi.update(id, data)
}

export const getDashboard = async (): Promise<DashboardResponse> => {
  return await ticketsApi.getDashboard()
}

export const getAssignedToMe = async (): Promise<TicketResponse[]> => {
  return await ticketsApi.getAssignedToMe()
}

// Ticket Messages wrapper functions
export const getMessages = async (ticketId: string | number): Promise<TicketMessageResponse[]> => {
  return await ticketMessagesApi.getAll(ticketId)
}

export const createMessage = async (
  ticketId: string | number,
  data: CreateTicketMessageRequest,
): Promise<TicketMessageResponse> => {
  return await ticketMessagesApi.create(ticketId, data)
}

export const deleteMessage = async (
  ticketId: string | number,
  messageId: string | number,
): Promise<void> => {
  return await ticketMessagesApi.delete(ticketId, messageId)
}

// Ticket Attachments wrapper functions
export const getAttachments = async (
  ticketId: string | number,
): Promise<TicketAttachmentResponse[]> => {
  return await ticketAttachmentsApi.getAll(ticketId)
}

export const uploadAttachment = async (
  ticketId: string | number,
  file: File,
): Promise<TicketAttachmentResponse> => {
  return await ticketAttachmentsApi.upload(ticketId, file)
}

export const downloadAttachment = async (
  ticketId: string | number,
  attachmentId: string | number,
): Promise<Blob> => {
  return await ticketAttachmentsApi.download(ticketId, attachmentId)
}

export const deleteAttachment = async (
  ticketId: string | number,
  attachmentId: string | number,
): Promise<void> => {
  return await ticketAttachmentsApi.delete(ticketId, attachmentId)
}

// User wrapper functions
export const getCurrentUser = async (): Promise<UserResponse> => {
  return await usersApi.getCurrentUser()
}

export const updateCurrentUser = async (data: UpdateUserProfileRequest): Promise<UserResponse> => {
  return await usersApi.updateCurrentUser(data)
}

export const getUsers = async (): Promise<UserResponse[]> => {
  return await usersApi.getAll()
}

export const getUser = async (id: string): Promise<UserResponse> => {
  return await usersApi.getById(id)
}

export const getTechnicians = async (): Promise<UserResponse[]> => {
  return await usersApi.getTechnicians()
}

export const getUsersByRole = async (role: string): Promise<UserResponse[]> => {
  return await usersApi.getByRole(role)
}

export const getUserStatistics = async (): Promise<UserStatsResponse> => {
  return await usersApi.getStatistics()
}

// Admin functions
export const createUser = async (data: CreateUserRequest): Promise<UserResponse> => {
  return await usersApi.create(data)
}

export const updateUserRole = async (userId: string, role: UserRoleType): Promise<UserResponse> => {
  return await usersApi.updateRole(userId, { role })
}

export const updateUserStatus = async (
  userId: string,
  status: UserStatusType,
): Promise<UserResponse> => {
  return await usersApi.updateStatus(userId, { status })
}

export const activateUser = async (userId: string): Promise<UserResponse> => {
  return await usersApi.activate(userId)
}

export const deactivateUser = async (userId: string): Promise<UserResponse> => {
  return await usersApi.deactivate(userId)
}

// User Sync wrapper functions
export const forceUserSync = async (): Promise<UserResponse> => {
  return await usersApi.forceSync()
}

export const checkUserExists = async (): Promise<boolean> => {
  const response = await usersApi.checkExists()
  return response.exists
}

export const getTokenInfo = async () => {
  return await usersApi.getTokenInfo()
}

export const createMinimalUser = async (): Promise<UserResponse> => {
  return await usersApi.createMinimal()
}
